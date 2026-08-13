import { parseSnapshot } from "./snapshot";
import { state, createInitialDiagnostics } from "./state";
import { pushSnapshotToScene, reconnectScene } from "./owlbearSync";
import OBR from "@owlbear-rodeo/sdk";

const statusEl = document.querySelector<HTMLDivElement>("#status");
const importButton = document.querySelector<HTMLButtonElement>("#import");
const pushButton = document.querySelector<HTMLButtonElement>("#push");
const reconnectButton = document.querySelector<HTMLButtonElement>("#reconnect");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");
const snapshotInput = document.querySelector<HTMLTextAreaElement>("#snapshot");
let actionStatus = "Готово";

importButton?.addEventListener("click", () => runAction(importSnapshot));
pushButton?.addEventListener("click", () => runAction(pushSnapshot));
reconnectButton?.addEventListener("click", () => runAction(reconnect));
refreshButton?.addEventListener("click", () => runAction(refreshDiagnostics));

render();

void OBR.onReady(() => {
	state.diagnostics = { ...state.diagnostics, sceneReady: true };
	render();
});

async function importSnapshot() {
	let text = snapshotInput?.value.trim() ?? "";
	if (!text) {
		try {
			text = await navigator.clipboard.readText();
		} catch {
			throw new Error("Вставьте JSON snapshot в поле выше через Ctrl+V, затем нажмите «Импорт».");
		}
	}
	state.snapshot = parseSnapshot(text);
	state.diagnostics = {
		...createInitialDiagnostics(),
		snapshotLoaded: true,
		participantCount: state.snapshot.participants.length,
	};
}

async function pushSnapshot() {
	if (!state.snapshot) {
		state.diagnostics = { ...state.diagnostics, lastError: "Import a snapshot first." };
		return;
	}

	const result = await pushSnapshotToScene(state.snapshot);
	state.diagnostics = result.diagnostics;
}

async function reconnect() {
	if (!state.snapshot) {
		state.diagnostics = { ...state.diagnostics, lastError: "Import a snapshot first." };
		return;
	}

	const result = await reconnectScene(state.snapshot);
	state.diagnostics = result.diagnostics;
}

async function refreshDiagnostics() {
	state.diagnostics = {
		...state.diagnostics,
		sceneReady: await OBR.scene.isReady(),
	};
}

async function runAction(action: () => Promise<void>) {
	setDisabled(true);
	actionStatus = "Выполняется...";
	render();
	try {
		await action();
		actionStatus = "Готово";
	} catch (error) {
		actionStatus = "Ошибка";
		state.diagnostics = {
			...state.diagnostics,
			lastError: formatError(error),
		};
	} finally {
		setDisabled(false);
		render();
	}
}

function formatError(error: unknown) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	if (error && typeof error === "object") {
		const details = error as Record<string, unknown>;
		if (typeof details.message === "string") return details.message;
		try {
			return JSON.stringify(error);
		} catch {
			return "Неизвестная ошибка Owlbear.";
		}
	}
	return String(error);
}

function render() {
	if (!statusEl) return;
	const diagnostics = state.diagnostics;
	statusEl.innerHTML = "";
	statusEl.append(
		row("Снимок из плагина", state.snapshot ? "да" : "нет"),
		row("Активная сцена", diagnostics.sceneReady ? "да" : "нет"),
		row("Связанные токены", `${diagnostics.linkedCount} / ${diagnostics.participantCount}`),
		row("Устаревшие связи", String(diagnostics.staleTokenIds.length)),
		row("Потерянные участники", String(diagnostics.missingParticipantIds.length)),
		row("Последняя синхронизация", diagnostics.lastSyncAt ?? "нет"),
		row("Последнее действие", actionStatus),
	);
	if (diagnostics.lastError) {
		const errorRow = row("Ошибка", diagnostics.lastError);
		errorRow.classList.add("error");
		statusEl.append(errorRow);
	}
}

function row(label: string, value: string) {
	const element = document.createElement("div");
	element.className = "row";
	const labelEl = document.createElement("span");
	labelEl.textContent = label;
	const valueEl = document.createElement("span");
	valueEl.className = "value";
	valueEl.textContent = value;
	element.append(labelEl, valueEl);
	return element;
}

function setDisabled(disabled: boolean) {
	for (const button of [importButton, pushButton, reconnectButton, refreshButton]) {
		if (button) button.disabled = disabled;
	}
}
