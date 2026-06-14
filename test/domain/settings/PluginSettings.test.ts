import { describe, expect, it } from "vitest";
import {
	PANEL_KEYS,
	createDefaultSettings,
	normalizeSettings,
} from "src/domain/settings/PluginSettings";

describe("PluginSettings", () => {
	it("defaults fresh installations to an empty Omni workspace", () => {
		const settings = createDefaultSettings(false);

		expect(settings.mode).toBe("omni");
		expect(settings.omniWorkspace.layout).toBe("single");
		expect(settings.omniWorkspace.tiles).toEqual([
			{ tabs: [], activeTab: null },
			{ tabs: [], activeTab: null },
		]);
	});

	it("defaults upgrades to Separate mode with every panel enabled", () => {
		const settings = createDefaultSettings(true);

		expect(settings.mode).toBe("separate");
		expect(PANEL_KEYS.every((key) => settings.separatePanels[key])).toBe(true);
	});

	it("normalizes unknown and duplicate tabs", () => {
		const settings = normalizeSettings({
			mode: "omni",
			omniWorkspace: {
				layout: "vertical-split",
				focusedTile: 1,
				tiles: [
					{
						tabs: ["bestiary", "unknown", "bestiary", "spellbook"],
						activeTab: "unknown",
					},
					{
						tabs: ["spellbook", "initiative-tracker"],
						activeTab: "initiative-tracker",
					},
				],
			},
		}, false);

		expect(settings.omniWorkspace).toEqual({
			layout: "vertical-split",
			focusedTile: 1,
			tiles: [
				{ tabs: ["bestiary", "spellbook"], activeTab: "bestiary" },
				{ tabs: ["initiative-tracker"], activeTab: "initiative-tracker" },
			],
		});
	});

	it("merges a hidden second tile when normalizing a single layout", () => {
		const settings = normalizeSettings({
			omniWorkspace: {
				layout: "single",
				focusedTile: 1,
				tiles: [
					{ tabs: ["bestiary"], activeTab: "bestiary" },
					{ tabs: ["spellbook"], activeTab: "spellbook" },
				],
			},
		}, false);

		expect(settings.omniWorkspace.focusedTile).toBe(0);
		expect(settings.omniWorkspace.tiles[0]).toEqual({
			tabs: ["bestiary", "spellbook"],
			activeTab: "bestiary",
		});
		expect(settings.omniWorkspace.tiles[1]).toEqual({ tabs: [], activeTab: null });
	});

	it("repairs partial Separate settings with safe defaults", () => {
		const settings = normalizeSettings({
			mode: "separate",
			separatePanels: { bestiary: false },
		}, true);

		expect(settings.separatePanels.bestiary).toBe(false);
		expect(settings.separatePanels.spellbook).toBe(true);
	});
});

