import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

export const PANEL_TYPE_COLORS = {
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

export function getPanelTypeColor(panelKey: PanelKey): string {
	return (
		PANEL_TYPE_COLORS[panelKey as keyof typeof PANEL_TYPE_COLORS] ??
		"#DC2626"
	);
}

const PANEL_TYPE_DESIGN_TOKENS = {
	bestiary: "--ds-bestiary",
	spellbook: "--ds-spell",
	"dm-screen": "--ds-armor",
	arsenal: "--ds-weapon",
	armory: "--ds-armor",
	equipment: "--ds-equipment",
	artifactory: "--ds-artifacts",
	backgrounds: "--ds-background",
	feats: "--ds-feat",
	races: "--ds-race",
	classes: "--ds-class",
	"character-sheets": "--ds-paladin",
} satisfies Partial<Record<PanelKey, string>>;

export function getRedesignPanelTypeColor(panelKey: PanelKey): string {
	const token = PANEL_TYPE_DESIGN_TOKENS[panelKey as keyof typeof PANEL_TYPE_DESIGN_TOKENS];
	return token ? `var(${token})` : getPanelTypeColor(panelKey);
}
