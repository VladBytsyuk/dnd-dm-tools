import OBR from "@owlbear-rodeo/sdk";
import { pushSnapshotToScene, reconnectScene } from "./owlbearSync";
import { connectionStatusText, formatDiagnosticsLog, type ConnectionState } from "./popoverUi";
import { state, createInitialDiagnostics } from "./state";
import type { OwlbearEncounterSnapshot } from "./types";

const PROTOCOL_VERSION = 1;
const AUTH_ERROR_CLOSE_CODE = 4001;
const PROTOCOL_ERROR_CLOSE_CODE = 4002;
const PAIRING_KEY = "dnd-dm-tools.owlbear.pairing";
const MANUAL_DISCONNECT_KEY = "dnd-dm-tools.owlbear.manual-disconnect";

const authStatusEl = document.querySelector<HTMLSpanElement>("#auth-status");
const statusEl = document.querySelector<HTMLDivElement>("#status");
const statusPanel = document.querySelector<HTMLElement>("#status-panel");
const pairingInput = document.querySelector<HTMLInputElement>("#pairing-code");
const editPairingButton = document.querySelector<HTMLButtonElement>("#edit-pairing");
const connectButton = document.querySelector<HTMLButtonElement>("#connect");
const reconnectButton = document.querySelector<HTMLButtonElement>("#reconnect");
const statusButton = document.querySelector<HTMLButtonElement>("#toggle-status");
const copyStatusButton = document.querySelector<HTMLButtonElement>("#copy-status");

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let copyFeedbackTimer: number | null = null;
let reconnectAttempts = 0;
let actionPending = false;
let isEditingPairing = false;
let isLogVisible = false;
let statusCopied = false;
let lastError: string | undefined;
let manuallyDisconnected = localStorage.getItem(MANUAL_DISCONNECT_KEY) === "true";
let connectionState: ConnectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";

editPairingButton?.addEventListener("click", () => {
	if (isEditingPairing) {
		isEditingPairing = false;
		void connect(pairingInput?.value.trim() ?? "");
		return;
	}
	isEditingPairing = true;
	if (pairingInput) pairingInput.value = localStorage.getItem(PAIRING_KEY) ?? "";
	render();
	window.setTimeout(() => pairingInput?.focus(), 0);
});

pairingInput?.addEventListener("keydown", (event) => {
	if (event.key !== "Enter") return;
	event.preventDefault();
	editPairingButton?.click();
});

connectButton?.addEventListener("click", () => {
	if (connectionState === "connected") {
		disconnect();
		return;
	}
	const pairingCode = localStorage.getItem(PAIRING_KEY) ?? "";
	if (pairingCode) void connect(pairingCode);
	else openPairingEditor();
});

reconnectButton?.addEventListener("click", () => void runAction(reconnectSceneItems));
statusButton?.addEventListener("click", () => {
	isLogVisible = !isLogVisible;
	render();
});
copyStatusButton?.addEventListener("click", () => void copyDiagnostics());

async function connect(pairingCode: string): Promise<void> {
	const pairing = parsePairingCode(pairingCode);
	if (!pairing) {
		connectionState = "auth-error";
		lastError = "Скопируйте корректный код сопряжения из настроек DnD DM Tools.";
		render();
		return;
	}

	localStorage.setItem(PAIRING_KEY, pairingCode);
	localStorage.removeItem(MANUAL_DISCONNECT_KEY);
	manuallyDisconnected = false;
	cancelReconnect();
	closeCurrentSocket();
	connectionState = "connecting";
	lastError = undefined;
	render();

	const nextSocket = new WebSocket(`ws://localhost:${pairing.port}/ws`);
	socket = nextSocket;
	nextSocket.onopen = () => send({ type: "client.hello", token: pairing.token });
	nextSocket.onmessage = (event) => void onMessage(event.data);
	nextSocket.onerror = () => {
		if (socket !== nextSocket) return;
		lastError = "Obsidian недоступен. Запустите Obsidian и включите интеграцию Owlbear.";
		render();
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
	render();
}

function handleSocketClose(closedSocket: WebSocket, event: CloseEvent): void {
	if (socket !== closedSocket) return;
	socket = null;

	if (event.code === AUTH_ERROR_CLOSE_CODE) {
		connectionState = "auth-error";
		lastError = event.reason || "Плагин отклонил код сопряжения.";
		render();
		return;
	}
	if (event.code === PROTOCOL_ERROR_CLOSE_CODE) {
		connectionState = "disconnected";
		lastError = event.reason || "Несовместимая версия протокола DnD DM Tools.";
		render();
		return;
	}

	connectionState = localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized";
	if (!lastError && event.code !== 1000) lastError = "Соединение с Obsidian потеряно.";
	render();

	if (!manuallyDisconnected && reconnectAttempts < 3 && localStorage.getItem(PAIRING_KEY)) {
		reconnectAttempts += 1;
		reconnectTimer = window.setTimeout(
			() => void connect(localStorage.getItem(PAIRING_KEY) ?? ""),
			1000 * reconnectAttempts,
		);
	}
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
		connectionState = "connected";
		reconnectAttempts = 0;
		lastError = undefined;
		render();
	}
	if (message.type === "snapshot.publish") await applySnapshot(message.snapshot);
	if (message.type === "pong") {
		connectionState = "connected";
		render();
	}
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

async function copyDiagnostics(): Promise<void> {
	const error = lastError ?? state.diagnostics.lastError;
	try {
		await writeClipboard(formatDiagnosticsLog(connectionState, state.diagnostics, error));
		statusCopied = true;
		if (copyFeedbackTimer !== null) window.clearTimeout(copyFeedbackTimer);
		copyFeedbackTimer = window.setTimeout(() => {
			statusCopied = false;
			copyFeedbackTimer = null;
			render();
		}, 1500);
	} catch (copyError) {
		lastError = `Не удалось скопировать лог: ${formatError(copyError)}`;
	}
	render();
}

async function writeClipboard(text: string): Promise<void> {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}
	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.append(textarea);
	textarea.select();
	const copied = document.execCommand("copy");
	textarea.remove();
	if (!copied) throw new Error("Буфер обмена недоступен.");
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

async function runAction(action: () => Promise<void>): Promise<void> {
	actionPending = true;
	render();
	try { await action(); lastError = undefined; } catch (error) { lastError = formatError(error); } finally { actionPending = false; render(); }
}

function formatError(error: unknown): string {
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

function openPairingEditor(): void {
	isEditingPairing = true;
	if (pairingInput) pairingInput.value = "";
	render();
	window.setTimeout(() => pairingInput?.focus(), 0);
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

function render(): void {
	const error = lastError ?? state.diagnostics.lastError;
	if (authStatusEl) {
		authStatusEl.hidden = isEditingPairing;
		authStatusEl.textContent = connectionStatusText(connectionState);
	}
	if (pairingInput) pairingInput.hidden = !isEditingPairing;

	setIconButton(editPairingButton, isEditingPairing ? "check" : "key", isEditingPairing ? "Сохранить код и подключиться" : "Изменить код сопряжения");
	setIconButton(connectButton, connectionState === "connected" ? "unplug" : "plug", connectionState === "connected" ? "Отключиться" : "Подключиться");
	setIconButton(reconnectButton, "link", "Связать сцену");
	setIconButton(statusButton, "status", isLogVisible ? "Скрыть статус" : "Показать статус");
	setIconButton(copyStatusButton, statusCopied ? "check" : "copy", statusCopied ? "Скопировано" : "Копировать лог");

	connectButton?.classList.toggle("active", connectionState === "connected");
	statusButton?.classList.toggle("active", isLogVisible);
	statusButton?.setAttribute("aria-expanded", String(isLogVisible));
	if (statusPanel) statusPanel.hidden = !isLogVisible;

	const connecting = connectionState === "connecting";
	if (editPairingButton) editPairingButton.disabled = connecting || actionPending;
	if (connectButton) connectButton.disabled = connecting || actionPending;
	if (reconnectButton) reconnectButton.disabled = actionPending;
	if (statusButton) statusButton.disabled = false;
	if (copyStatusButton) copyStatusButton.disabled = false;

	if (!statusEl) return;
	const diagnostics = state.diagnostics;
	statusEl.replaceChildren(
		row("Подключение", connectionStatusText(connectionState)),
		row("Активная сцена", diagnostics.sceneReady ? "да" : "нет"),
		row("Связанные токены", `${diagnostics.linkedCount} / ${diagnostics.participantCount}`),
		row("Последняя синхронизация", diagnostics.lastSyncAt ?? "нет"),
	);
	if (error) {
		const errorRow = row("Ошибка", error);
		errorRow.classList.add("error");
		statusEl.append(errorRow);
	}
}

function row(label: string, value: string): HTMLDivElement {
	const element = document.createElement("div");
	element.className = "row";
	const labelEl = document.createElement("span");
	labelEl.textContent = `${label}:`;
	const valueEl = document.createElement("span");
	valueEl.className = "value";
	valueEl.textContent = value;
	element.append(labelEl, valueEl);
	return element;
}

function setIconButton(button: HTMLButtonElement | null, iconName: IconName, label: string): void {
	if (!button) return;
	button.innerHTML = ICONS[iconName];
	button.title = label;
	button.setAttribute("aria-label", label);
}

type IconName = "key" | "check" | "plug" | "unplug" | "link" | "status" | "copy";

const ICONS: Record<IconName, string> = {
	key: icon('<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>'),
	check: icon('<path d="M20 6 9 17l-5-5"/>'),
	plug: icon('<path d="M12 22v-5M9 8V2m6 6V2M18 8v5a6 6 0 0 1-12 0V8Z"/>'),
	unplug: icon('<path d="m19 5 3-3M2 22l3-3M6 8v5a6 6 0 0 0 9.3 5M10 2v2m5-2v7.3M2 2l20 20"/>'),
	link: icon('<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>'),
	status: icon('<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>'),
	copy: icon('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
};

function icon(content: string): string {
	return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

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
if (storedPairing && !manuallyDisconnected) void connect(storedPairing);
