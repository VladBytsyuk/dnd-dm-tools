import {
	createDefaultAssistantWorkspace,
	loadAssistantWorkspace,
	type AssistantWorkspaceState,
} from "../assistant/AssistantWorkspace";
import type { OwlbearEncounterSnapshot } from "../owlbear/OwlbearSync";

export interface PluginSettingsState {
	schemaVersion: 2;
	workspace: AssistantWorkspaceState;
	owlbearSync?: {
		latestSnapshot?: OwlbearEncounterSnapshot;
	};
}

export interface PluginSettingsLoadResult {
	settings: PluginSettingsState;
	shouldResetLegacyViews: boolean;
}

export function createDefaultPluginSettings(): PluginSettingsState {
	return {
		schemaVersion: 2,
		workspace: createDefaultAssistantWorkspace(),
		owlbearSync: {},
	};
}

export function loadPluginSettings(value: unknown): PluginSettingsLoadResult {
	const defaults = createDefaultPluginSettings();
	if (!value || typeof value !== "object") {
		return { settings: defaults, shouldResetLegacyViews: false };
	}

	const stored = value as Record<string, any>;
	const workspaceResult = loadAssistantWorkspace(
		stored.schemaVersion === 2 ? stored.workspace : stored,
	);

	return {
		settings: {
			schemaVersion: 2,
			workspace: workspaceResult.workspace,
			owlbearSync: loadOwlbearSyncSettings(stored.owlbearSync),
		},
		shouldResetLegacyViews: workspaceResult.shouldResetLegacyViews,
	};
}

function loadOwlbearSyncSettings(value: unknown): PluginSettingsState["owlbearSync"] {
	if (!value || typeof value !== "object") return {};

	const stored = value as Record<string, any>;
	const latestSnapshot = stored.latestSnapshot;
	if (!latestSnapshot || typeof latestSnapshot !== "object") return {};
	if (latestSnapshot.schemaVersion !== 1) return {};

	return { latestSnapshot: latestSnapshot as OwlbearEncounterSnapshot };
}
