import {
	createDefaultAssistantWorkspace,
	loadAssistantWorkspace,
	type AssistantWorkspaceState,
} from "../assistant/AssistantWorkspace";
import type { OwlbearEncounterSnapshot } from "../owlbear/OwlbearSync";

export interface PluginSettingsState {
	schemaVersion: 3;
	workspace: AssistantWorkspaceState;
	owlbearSync: OwlbearSyncSettings;
}

export interface OwlbearSyncSettings {
	enabled: boolean;
	port: number | null;
	authToken: string | null;
	developmentExtensionPath?: string;
	latestSnapshot?: OwlbearEncounterSnapshot;
}

export interface PluginSettingsLoadResult {
	settings: PluginSettingsState;
	shouldResetLegacyViews: boolean;
}

export function createDefaultPluginSettings(): PluginSettingsState {
	return {
		schemaVersion: 3,
		workspace: createDefaultAssistantWorkspace(),
		owlbearSync: { enabled: false, port: null, authToken: null },
	};
}

export function loadPluginSettings(value: unknown): PluginSettingsLoadResult {
	const defaults = createDefaultPluginSettings();
	if (!value || typeof value !== "object") {
		return { settings: defaults, shouldResetLegacyViews: false };
	}

	const stored = value as Record<string, any>;
	const workspaceResult = loadAssistantWorkspace(
		(stored.schemaVersion === 2 || stored.schemaVersion === 3) ? stored.workspace : stored,
	);

	return {
		settings: {
			schemaVersion: 3,
			workspace: workspaceResult.workspace,
			owlbearSync: loadOwlbearSyncSettings(stored.owlbearSync),
		},
		shouldResetLegacyViews: workspaceResult.shouldResetLegacyViews,
	};
}

function loadOwlbearSyncSettings(value: unknown): OwlbearSyncSettings {
	if (!value || typeof value !== "object") {
		return { enabled: false, port: null, authToken: null };
	}

	const stored = value as Record<string, any>;
	const latestSnapshot = stored.latestSnapshot;
	return {
		enabled: stored.enabled === true,
		port: isPort(stored.port) ? stored.port : null,
		authToken: typeof stored.authToken === "string" && stored.authToken.length >= 32
			? stored.authToken
			: null,
		developmentExtensionPath: typeof stored.developmentExtensionPath === "string" && stored.developmentExtensionPath.trim()
			? stored.developmentExtensionPath.trim()
			: undefined,
		latestSnapshot: latestSnapshot && typeof latestSnapshot === "object" && latestSnapshot.schemaVersion === 1
			? latestSnapshot as OwlbearEncounterSnapshot
			: undefined,
	};
}

function isPort(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value >= 1024 && value <= 65535;
}
