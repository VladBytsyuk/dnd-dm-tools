import type { OwlbearSyncDiagnostics } from "./types";

export type ConnectionState = "unauthorized" | "disconnected" | "connecting" | "connected" | "auth-error";

export function connectionStatusText(state: ConnectionState): string {
	switch (state) {
		case "unauthorized": return "⚠️ Не авторизован";
		case "disconnected": return "Не подключено";
		case "connecting": return "Подключение...";
		case "connected": return "Подключено";
		case "auth-error": return "Ошибка авторизации";
	}
}

export function formatDiagnosticsLog(
	connectionState: ConnectionState,
	diagnostics: OwlbearSyncDiagnostics,
	error?: string,
): string {
	const rows = [
		["Подключение", connectionStatusText(connectionState)],
		["Активная сцена", diagnostics.sceneReady ? "да" : "нет"],
		["Связанные токены", `${diagnostics.linkedCount} / ${diagnostics.participantCount}`],
		["Последняя синхронизация", diagnostics.lastSyncAt ?? "нет"],
	];
	if (error) rows.push(["Ошибка", error]);
	return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}
