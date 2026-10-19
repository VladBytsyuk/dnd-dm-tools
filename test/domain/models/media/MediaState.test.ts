import { describe, expect, it } from "vitest";
import { updateVaultFilePath, loadMediaState, createMediaTrack, createMediaScene, removeMediaTrack } from "src/domain/models/media/MediaState";
import { sampleMedia, legacyMedia } from "../../../fixtures/media";
import { saveMediaRecord, removeMediaRecord, mediaItems, mediaCampaignName } from "src/domain/models/media/MediaLibrary";

describe("media library migration and ownership", () => {
	it("migrates one track per item and unused audio, keeping order, repeats and only one primary playlist", () => {
		const media = sampleMedia();
		expect(media.tracks).toHaveLength(3);
		expect(media.tracks.map((track) => track.loop)).toEqual([true, false, true]);
		expect(media.playlists.map((list) => list.items.length)).toEqual([1, 1]);
		expect(media.adventures[0].playlistId).toBe("music");
		expect(media.adventures[0].scenes[0]).toMatchObject({ name: "Start", notePath: "Scenes/Start.md", trackId: media.playlists[1].items[0].trackId });
		expect(loadMediaState(JSON.parse(JSON.stringify(media)))).toEqual(media);
		expect(createMediaTrack().loop).toBe(true);
		expect(legacyMedia().adventures[0].scenes[0].path).toBe("Scenes/Start.md");
	});
	it("preserves scenes without notes, shared notes and parallel arrows through reload", () => {
		const media = sampleMedia(), adventure = media.adventures[0];
		adventure.scenes.push(createMediaScene("Без заметки", "empty"));
		adventure.scenes[1].notePath = adventure.scenes[0].notePath;
		adventure.links.push({ ...adventure.links[0], id: "parallel", fromSide: "top", toSide: "right" });
		expect(loadMediaState(media).adventures[0]).toEqual(adventure);
	});
	it("updates note and audio paths on folder rename without modifying titles or IDs", () => {
		const media = sampleMedia(); media.adventures[0].notePath = "Scenes/Adventure.md";
		const moved = updateVaultFilePath(media, "Scenes", "New");
		expect(moved.adventures[0].notePath).toBe("New/Adventure.md");
		expect(moved.adventures[0].scenes[0]).toMatchObject({ id: "start", name: "Start", notePath: "New/Start.md" });
		expect(media.adventures[0].scenes[0].notePath).toBe("Scenes/Start.md");
		expect(updateVaultFilePath(media, "Audio", "Music").audioFiles[0].path).toBe("Music/calm.mp3");
	});
	it("rejects a missing adventure and transfers the scene without keeping old arrows", () => {
		const state = sampleMedia(), value = structuredClone(state.adventures[0].scenes[0]);
		expect(() => saveMediaRecord(state, "scene", value, "missing")).toThrow("Приключение не найдено");
		state.adventures.push({ ...structuredClone(state.adventures[0]), id: "second", url: "/adventure/second", scenes: [createMediaScene("Занято", "occupied")], links: [] });
		saveMediaRecord(state, "scene", value, "second");
		expect(state.adventures[0].scenes.map((scene) => scene.id)).toEqual(["end"]);
		expect(state.adventures[0].links).toEqual([]);
		expect(state.adventures[1].scenes[1].position).not.toEqual({ x: 0, y: 0 });
		expect(state.activeAdventureId).toBe("second");
	});
	it("saves standalone scenes, attaches and detaches the same record and restores active state", () => {
		const state = sampleMedia(), scene = createMediaScene("Независимая", "standalone");
		scene.campaignName = "Своя кампания"; scene.notePath = "Scenes/Start.md";
		saveMediaRecord(state, "scene", scene);
		state.activeSceneId = scene.id; state.activeAdventureId = null;
		expect(loadMediaState(JSON.parse(JSON.stringify(state)))).toEqual(state);
		saveMediaRecord(state, "scene", scene, "quest");
		expect(state.standaloneScenes).toEqual([]);
		expect(state.activeAdventureId).toBe("quest");
		expect(state.adventures[0].scenes.at(-1)?.position).not.toEqual(scene.position);
		state.adventures[0].links.push({ id: "attached-link", fromSceneId: "start", toSceneId: scene.id });
		saveMediaRecord(state, "scene", scene);
		expect(state.standaloneScenes).toEqual([scene]);
		expect(state.adventures[0].links.some((link) => link.toSceneId === scene.id)).toBe(false);
		expect(state.activeAdventureId).toBeNull();
		expect(mediaItems(state).filter((item) => item.record.id === scene.id)).toHaveLength(1);
	});
	it("inherits the current adventure campaign and defaults absent fields in old data", () => {
		const state = sampleMedia(); state.adventures[0].campaignName = "Культ";
		const item = mediaItems(state).find((item) => item.record.id === "start")!;
		expect(mediaCampaignName(item)).toBe("Культ");
		state.adventures[0].campaignName = "Новая кампания";
		expect(mediaCampaignName(item)).toBe("Новая кампания");
		const old = JSON.parse(JSON.stringify(state)); delete old.standaloneScenes;
		for (const scene of old.adventures[0].scenes) delete scene.campaignName;
		const loaded = loadMediaState(old);
		expect(loaded.standaloneScenes).toEqual([]);
		expect(loaded.adventures[0].scenes[0].campaignName).toBe("");
	});
	it("renames standalone notes, clears deleted tracks and removes standalone scenes", () => {
		const state = sampleMedia(), scene = createMediaScene("Сцена", "solo");
		scene.notePath = "Scenes/Start.md"; scene.trackId = state.tracks[0].id;
		state.standaloneScenes.push(scene);
		const moved = updateVaultFilePath(state, "Scenes", "New");
		expect(moved.standaloneScenes[0].notePath).toBe("New/Start.md");
		expect(removeMediaTrack(state, scene.trackId).standaloneScenes[0].trackId).toBeNull();
		removeMediaRecord(state, { kind: "track", id: scene.trackId });
		expect(state.standaloneScenes[0].trackId).toBeNull();
		state.activeSceneId = scene.id; state.activeAdventureId = null;
		removeMediaRecord(state, { kind: "scene", id: scene.id });
		expect(state.standaloneScenes).toEqual([]);
		expect(state.activeSceneId).toBeNull();
	});
	it("removes only plugin references when deleting records", () => {
		const state = sampleMedia(), trackId = state.playlists[1].items[0].trackId;
		removeMediaRecord(state, { kind: "track", id: trackId });
		expect(state.adventures[0].scenes[0].trackId).toBeNull();
		expect(state.playlists[1].items).toEqual([]);
		removeMediaRecord(state, { kind: "scene", id: "start" });
		expect(state.adventures[0].links).toEqual([]);
		expect(state.audioFiles).toHaveLength(3);
	});
});
