import { describe, expect, it } from "vitest";
import { loadPluginSettings } from "src/domain/models/settings/PluginSettings";

describe("PluginSettings", () => {
	it.each([true, false, undefined])("ignores the obsolete design toggle (%s) and preserves supported settings", (redesignEnabled) => {
		const settings = loadPluginSettings(null).settings;
		settings.workspace.tiles[0].tabs = ["bestiary", "player"];
		settings.workspace.tiles[0].activeTab = "player";
		settings.media.musicVolume = 0.4;
		settings.owlbearSync = { enabled: true, port: 43125, authToken: "a".repeat(43) };
		const result = loadPluginSettings({ ...settings, redesignEnabled });

		expect(result.settings).toEqual(settings);
		expect(result.settings).not.toHaveProperty("redesignEnabled");
		expect(JSON.parse(JSON.stringify(result.settings))).not.toHaveProperty("redesignEnabled");
	});

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

		expect(result.settings.schemaVersion).toBe(6);
		expect(result.settings.media.playlists).toEqual([]);
		expect(result.settings).not.toHaveProperty("redesignEnabled");
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

	it("restores media and the new panel tabs after a restart", () => {
		const result = loadPluginSettings({
			schemaVersion: 5,
			workspace: { layout: "single", focusedTile: 0, splitRatio: 0.5, tiles: [
				{ tabs: ["player", "adventures"], activeTab: "adventures" },
				{ tabs: [], activeTab: null },
			] },
			media: {
				audioFiles: [{ id: "audio", path: "Music/scene.mp3", alias: "Сцена" }],
				playlists: [{ id: "list", name: "Сессия", items: [{ id: "item", normalAudioId: "audio", combatAudioId: null, loop: true }] }],
				adventures: [], musicVolume: 0.5, effectsVolume: 0.75,
				activeAdventureId: null, activeSceneId: null,
			},
		});
		expect(result.settings.workspace.tiles[0]).toEqual({ tabs: ["player", "adventures"], activeTab: "adventures" });
		expect(result.settings.media.tracks[0].loop).toBe(true);
		expect(result.settings.media.musicVolume).toBe(0.5);
	});
	it("requests a raw media backup once when migrating settings version five", () => {
		const raw = { audioFiles: [], playlists: [], adventures: [], musicVolume: 0.2, effectsVolume: 0.4 };
		const migrated = loadPluginSettings({ schemaVersion: 5, media: raw });
		expect(migrated.legacyMediaBackup).toEqual(raw);
		expect(loadPluginSettings(migrated.settings).legacyMediaBackup).toBeUndefined();
		expect(migrated.settings.schemaVersion).toBe(6);
	});

});
