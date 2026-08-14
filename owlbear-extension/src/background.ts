import OBR from "@owlbear-rodeo/sdk";
import { pushSnapshotToScene, reconnectScene } from "./owlbearSync";
import { state, createInitialDiagnostics } from "./state";
import type { OwlbearEncounterSnapshot } from "./types";
import {
	AUTH_ERROR_CLOSE_CODE,
	MANUAL_DISCONNECT_KEY,
	PAIRING_KEY,
	PROTOCOL_ERROR_CLOSE_CODE,
	PROTOCOL_VERSION,
	RUNTIME_CHANNEL_NAME,
	type IntegrationMessage,
	type RuntimeMessage,
	type RuntimeState,
} from "./protocol";
import type { ConnectionState } from "./popoverUi";

const APPLY_QUEUE_EMPTY = Symbol("empty");
const channel = new BroadcastChannel(RUNTIME_CHANNEL_NAME);
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectAttempts = 0;
let manuallyDisconnected = localStorage.getItem(MANUAL_DISCONNECT_KEY) === "true";
let connectionState: ConnectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
let lastError: string | undefined;
let actionPending = false;
let applying = false;
let pendingSnapshot: unknown | typeof APPLY_QUEUE_EMPTY = APPLY_QUEUE_EMPTY;
let readyResolve: (() => void) | null = null;
const readyPromise = new Promise<void>((resolve) => { readyResolve = resolve; });

channel.addEventListener("message", (event: MessageEvent<RuntimeMessage>) => void handleRuntimeMessage(event.data));
window.addEventListener("storage", (event) => {
	if (event.key === MANUAL_DISCONNECT_KEY) manuallyDisconnected = event.newValue === "true";
});

function postState(): void {
	const runtimeState: RuntimeState = {
		connectionState,
		diagnostics: state.diagnostics,
		lastError: lastError ?? state.diagnostics.lastError,
		actionPending,
		snapshotAvailable: state.snapshot !== null,
	};
	channel.postMessage({ type: "runtime.state", state: runtimeState } satisfies RuntimeMessage);
}

async function handleRuntimeMessage(message: RuntimeMessage): Promise<void> {
	if (!message || typeof message !== "object") return;
	if (message.type === "ui.request") { postState(); return; }
	if (message.type !== "ui.command") return;
	if (message.command === "connect") {
		await connect(message.pairingCode ?? localStorage.getItem(PAIRING_KEY) ?? "", true);
		return;
	}
	if (message.command === "disconnect") { disconnect(); return; }
	await runAction(reconnectSceneItems);
}

async function connect(pairingCode: string, resetAttempts: boolean): Promise<void> {
	const pairing = parsePairingCode(pairingCode);
	if (!pairing) {
		connectionState = "auth-error";
		lastError = "Скопируйте корректный код сопряжения из настроек DnD DM Tools.";
		postState();
		return;
	}
	if (resetAttempts) reconnectAttempts = 0;
	localStorage.setItem(PAIRING_KEY, pairingCode);
	localStorage.removeItem(MANUAL_DISCONNECT_KEY);
	manuallyDisconnected = false;
	cancelReconnect();
	closeCurrentSocket();
	connectionState = "connecting";
	lastError = undefined;
	postState();

	const nextSocket = new WebSocket(`ws://localhost:${pairing.port}/ws`);
	socket = nextSocket;
	nextSocket.onopen = () => send({ type: "client.hello", token: pairing.token });
	nextSocket.onmessage = (event) => void onSocketMessage(event.data);
	nextSocket.onerror = () => {
		if (socket !== nextSocket) return;
		lastError = "Obsidian недоступен. Запустите Obsidian и включите интеграцию Owlbear.";
		postState();
	};
	nextSocket.onclose = (event) => handleSocketClose(nextSocket, event);
}

function disconnect(): void {
	manuallyDisconnected = true;
	localStorage.setItem(MANUAL_DISCONNECT_KEY, "true");
	reconnectAttempts = 0;
	cancelReconnect();
	closeCurrentSocket();
	connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
	lastError = undefined;
	postState();
}

function handleSocketClose(closedSocket: WebSocket, event: CloseEvent): void {
	if (socket !== closedSocket) return;
	socket = null;
	if (event.code === AUTH_ERROR_CLOSE_CODE) {
		connectionState = "auth-error";
		lastError = event.reason || "Плагин отклонил код сопряжения.";
		postState();
		return;
	}
	if (event.code === PROTOCOL_ERROR_CLOSE_CODE) {
		connectionState = "disconnected";
		lastError = event.reason || "Несовместимая версия протокола DnD DM Tools.";
		postState();
		return;
	}
	connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
	if (!lastError && event.code !== 1000) lastError = "Соединение с Obsidian потеряно.";
	postState();
	if (!manuallyDisconnected && localStorage.getItem(PAIRING_KEY)) {
		reconnectAttempts += 1;
		reconnectTimer = window.setTimeout(() => void connect(localStorage.getItem(PAIRING_KEY) ?? "", false), Math.min(30_000, 1000 * 2 ** Math.min(reconnectAttempts - 1, 5)));
	}
}

async function onSocketMessage(data: unknown): Promise<void> {
	let message: IntegrationMessage;
	try { message = JSON.parse(String(data)) as IntegrationMessage; } catch { return; }
	if (message.protocolVersion !== PROTOCOL_VERSION || typeof message.type !== "string") {
		lastError = "Несовместимая версия протокола DnD DM Tools.";
		postState();
		return;
	}
	if (message.type === "server.ready") {
		connectionState = "connected";
		reconnectAttempts = 0;
		lastError = undefined;
		postState();
		send({ type: "snapshot.request" });
		return;
	}
	if (message.type === "snapshot.publish") {
		pendingSnapshot = { value: message.snapshot, snapshotId: message.snapshotId };
		if (!applying) void drainApplyQueue();
		return;
	}
	if (message.type === "snapshot.empty") {
		state.snapshot = null;
		state.diagnostics = createInitialDiagnostics();
		postState();
		return;
	}
	if (message.type === "pong") {
		connectionState = "connected";
		postState();
	}
}

async function drainApplyQueue(): Promise<void> {
	applying = true;
	while (pendingSnapshot !== APPLY_QUEUE_EMPTY) {
		const next = pendingSnapshot as { value: unknown; snapshotId?: string };
		pendingSnapshot = APPLY_QUEUE_EMPTY;
		await applySnapshot(next.value, next.snapshotId);
	}
	applying = false;
}

async function applySnapshot(value: unknown, snapshotId: string | undefined): Promise<void> {
	if (typeof snapshotId !== "string" || !isSnapshot(value)) {
		if (snapshotId) send({ type: "snapshot.failed", snapshotId, error: "Некорректный снапшот Owlbear." });
		return;
	}
	await readyPromise;
	const previousSnapshot = state.snapshot;
	state.diagnostics = { ...createInitialDiagnostics(), snapshotLoaded: true, participantCount: value.participants.length };
	try {
		const result = await pushSnapshotToScene(value, previousSnapshot);
		state.snapshot = value;
		state.diagnostics = result.diagnostics;
		lastError = result.diagnostics.lastError ? localizeSceneError(result.diagnostics.lastError) : undefined;
		send({ type: "snapshot.applied", snapshotId, tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
	} catch (error) {
		lastError = formatError(error);
		send({ type: "snapshot.failed", snapshotId, error: lastError });
	} finally {
		postState();
	}
}

async function reconnectSceneItems(): Promise<void> {
	if (!state.snapshot) throw new Error("Плагин ещё не отправил столкновение.");
	const result = await reconnectScene(state.snapshot);
	state.diagnostics = result.diagnostics;
	send({ type: "snapshot.applied", snapshotId: state.snapshot.snapshotId, tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
	postState();
}

async function runAction(action: () => Promise<void>): Promise<void> {
	actionPending = true;
	postState();
	try { await action(); lastError = undefined; } catch (error) { lastError = formatError(error); } finally { actionPending = false; postState(); }
}

function send(payload: Record<string, unknown>): void {
	if (socket?.readyState !== WebSocket.OPEN) return;
	socket.send(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, messageId: crypto.randomUUID(), ...payload }));
}

function parsePairingCode(value: string): { port: number; token: string } | null {
	const match = /^dnd-dm-tools:v1:(\d{4,5}):([A-Za-z0-9_-]{32,})$/.exec(value);
	if (!match) return null;
	const port = Number(match[1]);
	return port >= 1024 && port <= 65535 ? { port, token: match[2] } : null;
}

function isSnapshot(value: unknown): value is OwlbearEncounterSnapshot {
	if (!value || typeof value !== "object") return false;
	const snapshot = value as Record<string, unknown>;
	return snapshot.schemaVersion === 1 && typeof snapshot.snapshotId === "string" && Array.isArray(snapshot.participants) && Array.isArray(snapshot.tokenLinks);
}

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	try { return JSON.stringify(error); } catch { return "Ошибка Owlbear без доступных деталей."; }
}

function localizeSceneError(error: string): string {
	return error === "No active Owlbear scene." ? "Откройте комнату Owlbear и выберите активную сцену, затем отправьте encounter снова." : error;
}

function closeCurrentSocket(): void {
	const currentSocket = socket;
	socket = null;
	if (currentSocket && currentSocket.readyState < WebSocket.CLOSING) currentSocket.close(1000, "Client disconnect");
}

function cancelReconnect(): void {
	if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
	reconnectTimer = null;
}

void OBR.onReady(async () => {
	state.diagnostics = { ...state.diagnostics, sceneReady: await OBR.scene.isReady() };
	OBR.scene.onReadyChange((sceneReady) => { state.diagnostics = { ...state.diagnostics, sceneReady }; postState(); });
	readyResolve?.();
	postState();
});

postState();
const storedPairing = localStorage.getItem(PAIRING_KEY) ?? "";
if (storedPairing && !manuallyDisconnected) void connect(storedPairing, true);
