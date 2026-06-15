import { PANEL_KEYS } from "src/domain/models/assistant/AssistantWorkspace";

const LEGACY_VIEW_PREFIX = "obsidian-dnd-statblock-side-panel-";

export function detachLegacyPanelViews(
	workspace: { detachLeavesOfType(viewType: string): void },
): void {
	for (const key of PANEL_KEYS) {
		workspace.detachLeavesOfType(`${LEGACY_VIEW_PREFIX}${key}`);
	}
}
