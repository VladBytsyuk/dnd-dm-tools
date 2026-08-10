import { describe, expect, it } from "vitest";
import { loadPluginSettings } from "src/domain/models/settings/PluginSettings";

describe("PluginSettings", () => {
	it("migrates legacy assistant workspace data into the settings envelope", () => {
		const result = loadPluginSettings({
			layout: "vertical-split",
			focusedTile: 1,
			splitRatio: 0.4,
			tiles: [
				{ tabs: ["bestiary"], activeTab: "bestiary" },
				{ tabs: ["spellbook"], activeTab: "spellbook" },
			],
		});

		expect(result.settings.schemaVersion).toBe(2);
		expect(result.settings.workspace.layout).toBe("vertical-split");
		expect(result.settings.workspace.tiles[0].tabs).toEqual(["bestiary"]);
		expect(result.settings.workspace.tiles[1].tabs).toEqual(["spellbook"]);
		expect("characterSheetsEnabled" in result.settings).toBe(false);
		expect("lss" in result.settings).toBe(false);
	});

	it("loads workspace without keeping obsolete character sheet or LSS auth state", () => {
		const result = loadPluginSettings({
			schemaVersion: 2,
			characterSheetsEnabled: true,
			workspace: {
				layout: "single",
				focusedTile: 0,
				splitRatio: 0.5,
				tiles: [{ tabs: ["classes"], activeTab: "classes" }, { tabs: [], activeTab: null }],
			},
			lss: {
				status: "connected",
				userEmail: "dm@example.com",
				encryptedCredentials: "encrypted",
				accessToken: "token",
				tokenUpdatedAt: 10,
				lastVerifiedAt: 20,
				errorMessage: null,
			},
		});

		expect(result.settings.workspace.tiles[0].tabs).toEqual(["classes"]);
		expect("characterSheetsEnabled" in result.settings).toBe(false);
		expect("lss" in result.settings).toBe(false);
	});
});
