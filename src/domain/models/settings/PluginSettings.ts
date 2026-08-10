import {
	createDefaultAssistantWorkspace,
	loadAssistantWorkspace,
	type AssistantWorkspaceState,
} from "../assistant/AssistantWorkspace";

export interface PluginSettingsState {
	schemaVersion: 2;
	workspace: AssistantWorkspaceState;
}

export interface PluginSettingsLoadResult {
	settings: PluginSettingsState;
	shouldResetLegacyViews: boolean;
}

export function createDefaultPluginSettings(): PluginSettingsState {
	return {
		schemaVersion: 2,
		workspace: createDefaultAssistantWorkspace(),
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
		},
		shouldResetLegacyViews: workspaceResult.shouldResetLegacyViews,
	};
}
