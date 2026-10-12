import { describe, expect, it } from "vitest";
import { createDefaultMediaState, type MediaState } from "src/domain/models/media/MediaState";
import {
	exportAdventureSnapshot,
	exportPlaylistSnapshot,
	importAdventureSnapshot,
	importPlaylistSnapshot,
	parseMediaSnapshot,
} from "src/domain/models/media/MediaSnapshot";

function sample(): MediaState {
	return {
		...createDefaultMediaState(),
		audioFiles: [
			{ id: "calm", path: "Audio/calm.mp3", alias: "Спокойно" },
			{ id: "battle", path: "Audio/battle.mp3", alias: "Бой" },
		],
		playlists: [{ id: "music", name: "Город", items: [{ id: "market", normalAudioId: "calm", combatAudioId: "battle", loop: true }] }],
		adventures: [{
			id: "quest", name: "Поход", playlistIds: ["music"],
			scenes: [
				{ id: "start", path: "Scenes/Start.md", playlistId: "music", itemId: "market" },
				{ id: "end", path: "Scenes/End.md", playlistId: null, itemId: null },
			],
			links: [{ fromSceneId: "start", toSceneId: "end" }],
		}],
	};
}

function ids() { let next = 0; return () => `new-${++next}`; }

describe("media Markdown snapshots", () => {
	it("imports a playlist as a copy and reuses audio by vault path", () => {
		const state = sample();
		const exported = exportPlaylistSnapshot(state, "music");
		const result = importPlaylistSnapshot(state, exported, ids(), () => true);
		expect(result.state.audioFiles).toHaveLength(2);
		expect(result.state.playlists).toHaveLength(2);
		const imported = result.state.playlists[1];
		expect(imported.id).not.toBe("music");
		expect(imported.items[0]).toMatchObject({ normalAudioId: "calm", combatAudioId: "battle", loop: true });
		expect(result.missingPaths).toEqual([]);
	});

	it("imports an adventure with remapped scene, playlist and item references", () => {
		const original = sample();
		const result = importAdventureSnapshot(createDefaultMediaState(), exportAdventureSnapshot(original, "quest"), ids(), (path) => path !== "Scenes/End.md");
		const adventure = result.state.adventures[0];
		expect(adventure.id).not.toBe("quest");
		expect(adventure.playlistIds).toContain(result.state.playlists[0].id);
		expect(adventure.scenes[0].playlistId).toBe(result.state.playlists[0].id);
		expect(adventure.scenes[0].itemId).toBe(result.state.playlists[0].items[0].id);
		expect(adventure.links).toEqual([{ fromSceneId: adventure.scenes[0].id, toSceneId: adventure.scenes[1].id }]);
		expect(result.missingPaths).toEqual(["Scenes/End.md"]);
	});

	it("rejects malformed or wrong-kind blocks before import", () => {
		expect(() => parseMediaSnapshot("{bad json")).toThrow();
		expect(() => importPlaylistSnapshot(createDefaultMediaState(), exportAdventureSnapshot(sample(), "quest"), ids(), () => true)).toThrow();
	});
});
