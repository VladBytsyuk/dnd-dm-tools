import { describe, expect, it } from "vitest";
import { connectionStatusText, formatDiagnosticsLog } from "../../owlbear-extension/src/popoverUi";
import type { OwlbearSyncDiagnostics } from "../../owlbear-extension/src/types";

const diagnostics: OwlbearSyncDiagnostics = {
	snapshotLoaded: true,
	sceneReady: true,
	participantCount: 4,
	linkedCount: 3,
	staleTokenIds: [],
	missingParticipantIds: [],
	fallbackParticipantIds: [],
	lastSyncAt: "2026-08-13T12:00:00.000Z",
};

describe("Owlbear popover UI", () => {
	it("maps connection states to compact Russian labels", () => {
		expect(connectionStatusText("unauthorized")).toBe("⚠️ Не авторизован");
		expect(connectionStatusText("disconnected")).toBe("Не подключено");
		expect(connectionStatusText("connecting")).toBe("Подключение...");
		expect(connectionStatusText("connected")).toBe("Подключено");
		expect(connectionStatusText("auth-error")).toBe("Ошибка авторизации");
	});

	it("formats diagnostics as copyable rows with colons", () => {
		expect(formatDiagnosticsLog("connected", diagnostics, "Example error")).toBe([
			"Подключение: Подключено",
			"Активная сцена: да",
			"Связанные токены: 3 / 4",
			"Fallback-токены: 0",
			"Последняя синхронизация: 2026-08-13T12:00:00.000Z",
			"Ошибка: Example error",
		].join("\n"));
	});
});
