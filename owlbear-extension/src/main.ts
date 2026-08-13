import { state, createInitialDiagnostics } from "./state";
import { pushSnapshotToScene, reconnectScene } from "./owlbearSync";
import type { OwlbearEncounterSnapshot } from "./types";
import OBR from "@owlbear-rodeo/sdk";

const PROTOCOL_VERSION = 1;
const PAIRING_KEY = "dnd-dm-tools.owlbear.pairing";
const statusEl = document.querySelector<HTMLDivElement>("#status");
const pairingInput = document.querySelector<HTMLInputElement>("#pairing-code");
const connectButton = document.querySelector<HTMLButtonElement>("#connect");
const reconnectButton = document.querySelector<HTMLButtonElement>("#reconnect");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
let socket: WebSocket | null = null;
let connectionStatus = "Не подключено";
let lastError: string | undefined;
let reconnectAttempts = 0;

connectButton?.addEventListener("click", () => void connect(pairingInput?.value.trim() ?? ""));
reconnectButton?.addEventListener("click", () => runAction(reconnectSceneItems));
refreshButton?.addEventListener("click", () => runAction(refreshDiagnostics));

render();
void OBR.onReady(async () => {
	state.diagnostics = { ...state.diagnostics, sceneReady: await OBR.scene.isReady() };
	OBR.scene.onReadyChange((sceneReady) => {
		state.diagnostics = { ...state.diagnostics, sceneReady };
		render();
	});
	render();
});

const storedPairing = localStorage.getItem(PAIRING_KEY) ?? "";
if (pairingInput) pairingInput.value = storedPairing;
if (storedPairing) void connect(storedPairing);

async function connect(pairingCode: string): Promise<void> {
	const pairing = parsePairingCode(pairingCode);
	if (!pairing) {
		connectionStatus = "Неверный код сопряжения";
		lastError = "Скопируйте код сопряжения из настроек DnD DM Tools.";
		render();
		return;
	}
	localStorage.setItem(PAIRING_KEY, pairingCode);
	socket?.close();
	connectionStatus = "Подключение...";
	lastError = undefined;
	render();
	const nextSocket = new WebSocket(`ws://localhost:${pairing.port}/ws`);
	socket = nextSocket;
	nextSocket.onopen = () => send({ type: "client.hello", token: pairing.token });
	nextSocket.onmessage = (event) => void onMessage(event.data);
	nextSocket.onerror = () => {
		connectionStatus = "Obsidian недоступен";
		lastError = "Запустите Obsidian и включите интеграцию Owlbear.";
		render();
	};
	nextSocket.onclose = () => {
		if (socket !== nextSocket) return;
		connectionStatus = connectionStatus === "Подключено" ? "Соединение потеряно" : connectionStatus;
		render();
		if (reconnectAttempts < 3 && localStorage.getItem(PAIRING_KEY)) {
			reconnectAttempts += 1;
			window.setTimeout(() => void connect(localStorage.getItem(PAIRING_KEY) ?? ""), 1000 * reconnectAttempts);
		}
	};
}

async function onMessage(data: unknown): Promise<void> {
	let message: Record<string, unknown>;
	try { message = JSON.parse(String(data)) as Record<string, unknown>; } catch { return; }
	if (message.protocolVersion !== PROTOCOL_VERSION || typeof message.type !== "string") {
		lastError = "Несовместимая версия протокола DnD DM Tools.";
		render();
		return;
	}
	if (message.type === "server.ready") {
		connectionStatus = "Подключено";
		reconnectAttempts = 0;
		lastError = undefined;
		render();
	}
	if (message.type === "snapshot.publish") await applySnapshot(message.snapshot);
	if (message.type === "pong") { connectionStatus = "Подключено"; render(); }
}

async function applySnapshot(value: unknown): Promise<void> {
	if (!isSnapshot(value)) { render(); return; }
	const previousSnapshot = state.snapshot;
	state.diagnostics = { ...createInitialDiagnostics(), snapshotLoaded: true, participantCount: value.participants.length };
	try {
		const result = await pushSnapshotToScene(value, previousSnapshot);
		state.snapshot = value;
		state.diagnostics = result.diagnostics;
		lastError = result.diagnostics.lastError ? localizeSceneError(result.diagnostics.lastError) : undefined;
		send({ type: "snapshot.applied", tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
	} catch (error) {
		lastError = formatError(error);
		send({ type: "snapshot.failed", error: lastError });
	}
	render();
}

async function reconnectSceneItems(): Promise<void> {
	if (!state.snapshot) throw new Error("Плагин ещё не отправил столкновение.");
	const result = await reconnectScene(state.snapshot);
	state.diagnostics = result.diagnostics;
	send({ type: "snapshot.applied", tokenLinks: result.tokenLinks, diagnostics: result.diagnostics });
}

async function refreshDiagnostics(): Promise<void> {
	state.diagnostics = { ...state.diagnostics, sceneReady: await OBR.scene.isReady() };
	send({ type: "ping" });
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

async function runAction(action: () => Promise<void>) {
	setDisabled(true);
	try { await action(); lastError = undefined; } catch (error) { lastError = formatError(error); } finally { setDisabled(false); render(); }
}

function formatError(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	if (error && typeof error === "object") {
		const details = error as Record<string, unknown>;
		if (typeof details.message === "string") return details.message;
		try { return JSON.stringify(error); } catch { return "Ошибка Owlbear без доступных деталей."; }
	}
	return String(error);
}

function localizeSceneError(error: string): string {
	return error === "No active Owlbear scene."
		? "Откройте комнату Owlbear и выберите активную сцену, затем отправьте encounter снова."
		: error;
}

function render() {
	if (!statusEl) return;
	const diagnostics = state.diagnostics;
	statusEl.innerHTML = "";
	statusEl.append(
		row("Подключение", connectionStatus),
		row("Активная сцена", diagnostics.sceneReady ? "да" : "нет"),
		row("Связанные токены", `${diagnostics.linkedCount} / ${diagnostics.participantCount}`),
		row("Последняя синхронизация", diagnostics.lastSyncAt ?? "нет"),
	);
	const error = lastError ?? diagnostics.lastError;
	if (error) { const errorRow = row("Ошибка", error); errorRow.classList.add("error"); statusEl.append(errorRow); }
}

function row(label: string, value: string) {
	const element = document.createElement("div"); element.className = "row";
	const labelEl = document.createElement("span"); labelEl.textContent = label;
	const valueEl = document.createElement("span"); valueEl.className = "value"; valueEl.textContent = value;
	element.append(labelEl, valueEl); return element;
}

function setDisabled(disabled: boolean) { for (const button of [connectButton, reconnectButton, refreshButton]) if (button) button.disabled = disabled; }
