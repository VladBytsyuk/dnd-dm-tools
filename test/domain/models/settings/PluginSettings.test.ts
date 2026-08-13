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

		expect(result.settings.schemaVersion).toBe(3);
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

	it("preserves the latest Owlbear snapshot when schema version is supported", () => {
		const latestSnapshot = {
			schemaVersion: 1,
			snapshotId: "snapshot-1",
			encounterId: "encounter-1",
			encounterName: "Encounter",
			round: 1,
			activeParticipantId: null,
			createdAt: "2026-08-12T10:00:00.000Z",
			participants: [],
			tokenLinks: [],
		};

		const result = loadPluginSettings({
			schemaVersion: 2,
			workspace: {
				layout: "single",
				focusedTile: 0,
				splitRatio: 0.5,
				tiles: [{ tabs: ["initiative-tracker"], activeTab: "initiative-tracker" }, { tabs: [], activeTab: null }],
			},
			owlbearSync: { latestSnapshot },
		});

		expect(result.settings.owlbearSync?.latestSnapshot).toEqual(latestSnapshot);
		expect(result.settings.owlbearSync.enabled).toBe(false);
		expect(result.settings.owlbearSync.port).toBeNull();
	});

	it("loads persisted Owlbear connection settings", () => {
		const result = loadPluginSettings({
			schemaVersion: 3,
			workspace: {
				layout: "single", focusedTile: 0, splitRatio: 0.5,
				tiles: [{ tabs: [], activeTab: null }, { tabs: [], activeTab: null }],
			},
			owlbearSync: { enabled: true, port: 43125, authToken: "a".repeat(43) },
		});

		expect(result.settings.owlbearSync).toMatchObject({ enabled: true, port: 43125, authToken: "a".repeat(43) });
	});

	it("rejects invalid persisted Owlbear ports and tokens", () => {
		const result = loadPluginSettings({ owlbearSync: { enabled: true, port: 80, authToken: "short" } });
		expect(result.settings.owlbearSync).toMatchObject({ enabled: true, port: null, authToken: null });
	});
});
