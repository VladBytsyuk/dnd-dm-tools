import { connectionStatusText, formatDiagnosticsLog, type ConnectionState } from "./popoverUi";
import { createInitialDiagnostics } from "./state";
import { MANUAL_DISCONNECT_KEY, PAIRING_KEY, RUNTIME_CHANNEL_NAME, type RuntimeMessage, type RuntimeState } from "./protocol";

const authStatusEl = document.querySelector<HTMLSpanElement>("#auth-status");
const statusEl = document.querySelector<HTMLDivElement>("#status");
const statusPanel = document.querySelector<HTMLElement>("#status-panel");
const pairingInput = document.querySelector<HTMLInputElement>("#pairing-code");
const editPairingButton = document.querySelector<HTMLButtonElement>("#edit-pairing");
const connectButton = document.querySelector<HTMLButtonElement>("#connect");
const reconnectButton = document.querySelector<HTMLButtonElement>("#reconnect");
const statusButton = document.querySelector<HTMLButtonElement>("#toggle-status");
const copyStatusButton = document.querySelector<HTMLButtonElement>("#copy-status");
const channel = new BroadcastChannel(RUNTIME_CHANNEL_NAME);

let runtimeState: RuntimeState = {
	connectionState: localStorage.getItem(PAIRING_KEY) ? "disconnected" : "unauthorized",
	diagnostics: createInitialDiagnostics(),
	actionPending: false,
	snapshotAvailable: false,
};
let copyFeedbackTimer: number | null = null;
let isEditingPairing = false;
let isLogVisible = false;
let statusCopied = false;

channel.addEventListener("message", (event: MessageEvent<RuntimeMessage>) => {
		if (event.data?.type !== "runtime.state") return;
		runtimeState = event.data.state;
		render();
});

editPairingButton?.addEventListener("click", () => {
	if (isEditingPairing) {
		isEditingPairing = false;
		const pairingCode = pairingInput?.value.trim() ?? "";
		localStorage.setItem(PAIRING_KEY, pairingCode);
		localStorage.removeItem(MANUAL_DISCONNECT_KEY);
		command({ type: "ui.command", command: "connect", pairingCode });
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
	if (runtimeState.connectionState === "connected") {
		command({ type: "ui.command", command: "disconnect" });
		return;
	}
	const pairingCode = localStorage.getItem(PAIRING_KEY) ?? "";
	if (pairingCode) command({ type: "ui.command", command: "connect", pairingCode });
	else openPairingEditor();
});

reconnectButton?.addEventListener("click", () => command({ type: "ui.command", command: "reconnect" }));
statusButton?.addEventListener("click", () => { isLogVisible = !isLogVisible; render(); });
copyStatusButton?.addEventListener("click", () => void copyDiagnostics());

function command(message: RuntimeMessage): void { channel.postMessage(message); }

async function copyDiagnostics(): Promise<void> {
	try {
		await writeClipboard(formatDiagnosticsLog(runtimeState.connectionState, runtimeState.diagnostics, runtimeState.lastError));
		statusCopied = true;
		if (copyFeedbackTimer !== null) window.clearTimeout(copyFeedbackTimer);
		copyFeedbackTimer = window.setTimeout(() => { statusCopied = false; copyFeedbackTimer = null; render(); }, 1500);
	} catch (error) {
		runtimeState = { ...runtimeState, lastError: `Не удалось скопировать лог: ${formatError(error)}` };
	}
	render();
}

async function writeClipboard(text: string): Promise<void> {
	if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
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

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	try { return JSON.stringify(error); } catch { return "Ошибка без доступных деталей."; }
}

function openPairingEditor(): void {
	isEditingPairing = true;
	if (pairingInput) pairingInput.value = "";
	render();
	window.setTimeout(() => pairingInput?.focus(), 0);
}

function render(): void {
	const error = runtimeState.lastError ?? runtimeState.diagnostics.lastError;
	if (authStatusEl) {
		authStatusEl.hidden = isEditingPairing;
		authStatusEl.textContent = connectionStatusText(runtimeState.connectionState);
	}
	if (pairingInput) pairingInput.hidden = !isEditingPairing;
	setIconButton(editPairingButton, isEditingPairing ? "check" : "key", isEditingPairing ? "Сохранить код и подключиться" : "Изменить код сопряжения");
	setIconButton(connectButton, runtimeState.connectionState === "connected" ? "unplug" : "plug", runtimeState.connectionState === "connected" ? "Отключиться" : "Подключиться");
	setIconButton(reconnectButton, "link", "Связать сцену");
	setIconButton(statusButton, "status", isLogVisible ? "Скрыть статус" : "Показать статус");
	setIconButton(copyStatusButton, statusCopied ? "check" : "copy", statusCopied ? "Скопировано" : "Копировать лог");
	connectButton?.classList.toggle("active", runtimeState.connectionState === "connected");
	statusButton?.classList.toggle("active", isLogVisible);
	statusButton?.setAttribute("aria-expanded", String(isLogVisible));
	if (statusPanel) statusPanel.hidden = !isLogVisible;
	const connecting = runtimeState.connectionState === "connecting";
	if (editPairingButton) editPairingButton.disabled = connecting || runtimeState.actionPending;
	if (connectButton) connectButton.disabled = connecting || runtimeState.actionPending;
	if (reconnectButton) reconnectButton.disabled = runtimeState.actionPending || !runtimeState.snapshotAvailable;
	if (!statusEl) return;
	const diagnostics = runtimeState.diagnostics;
	statusEl.replaceChildren(
		row("Подключение", connectionStatusText(runtimeState.connectionState)),
		row("Активная сцена", diagnostics.sceneReady ? "да" : "нет"),
		row("Связанные токены", `${diagnostics.linkedCount} / ${diagnostics.participantCount}`),
		row("Fallback-токены", String(diagnostics.fallbackParticipantIds.length)),
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
	copy: icon('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
};

function icon(content: string): string {
	return `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

render();
command({ type: "ui.request" });
