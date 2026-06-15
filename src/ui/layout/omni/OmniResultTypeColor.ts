import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

export const OMNI_RESULT_TYPE_COLORS = {
	bestiary: "#D45555",
	spellbook: "#8B5CF6",
	"dm-screen": "#64748B",
	arsenal: "#E76F51",
	armory: "#4F7CAC",
	equipment: "#D39B32",
	artifactory: "#B85CBF",
	backgrounds: "#9A6B4F",
	feats: "#4F9D69",
	races: "#2A9D8F",
	classes: "#3B82C4",
	"character-sheets": "#6366F1",
} satisfies Partial<Record<PanelKey, string>>;

export function getOmniResultTypeColor(panelKey: PanelKey): string {
	return OMNI_RESULT_TYPE_COLORS[
		panelKey as keyof typeof OMNI_RESULT_TYPE_COLORS
	] ?? "#64748B";
}
