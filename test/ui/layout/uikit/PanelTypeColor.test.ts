import { describe, expect, it } from "vitest";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import {
	getPanelTypeColor,
	PANEL_TYPE_COLORS,
} from "src/ui/layout/uikit/PanelTypeColor";

const SEARCHABLE_PANEL_KEYS: PanelKey[] = [
	"bestiary",
	"spellbook",
	"dm-screen",
	"arsenal",
	"armory",
	"equipment",
	"artifactory",
	"backgrounds",
	"feats",
	"races",
	"classes",
	"character-sheets",
];

describe("PanelTypeColor", () => {
	it("defines a distinct color for every searchable panel type", () => {
		const colors = SEARCHABLE_PANEL_KEYS.map(getPanelTypeColor);

		expect(Object.keys(PANEL_TYPE_COLORS)).toHaveLength(
			SEARCHABLE_PANEL_KEYS.length,
		);
		expect(new Set(colors).size).toBe(SEARCHABLE_PANEL_KEYS.length);
	});

	it("uses the neutral reference color for a panel without search results", () => {
		expect(getPanelTypeColor("initiative-tracker")).toBe("#DC2626");
	});
});
