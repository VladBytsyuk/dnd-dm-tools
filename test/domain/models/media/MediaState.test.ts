import { describe, expect, it } from "vitest";
import { updateVaultFilePath, loadMediaState, createMediaTrack, createMediaScene } from "src/domain/models/media/MediaState";
import { sampleMedia, legacyMedia } from "../../../fixtures/media";
import { applyLegacyMedia, toLegacyMedia } from "src/domain/models/media/LegacyMedia";
import { saveMediaRecord, removeMediaRecord } from "src/domain/models/media/MediaLibrary";

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
	it("keeps canonical metadata and standalone tracks when editing the legacy projection", () => {
		const state = sampleMedia(); state.tracks[0].atmosphere = "тихая"; state.adventures[0].campaignName = "Кампания";
		const before = toLegacyMedia(state), next = structuredClone(before);
		next.playlists[0].name = "Новое"; next.playlists[0].items[0].loop = false;
		applyLegacyMedia(state, before, next);
		expect(state.tracks[0]).toMatchObject({ atmosphere: "тихая", loop: false });
		expect(state.adventures[0].campaignName).toBe("Кампания");
		expect(state.adventures[0].scenes[0].trackId).toBe(state.playlists[1].items[0].trackId);
		expect(state.tracks).toHaveLength(3);
	});
	it("requires a scene parent and transfers the scene without keeping old arrows", () => {
		const state = sampleMedia(), value = structuredClone(state.adventures[0].scenes[0]);
		expect(() => saveMediaRecord(state, "scene", value)).toThrow("приключение");
		state.adventures.push({ ...structuredClone(state.adventures[0]), id: "second", url: "/adventure/second", scenes: [createMediaScene("Занято", "occupied")], links: [] });
		saveMediaRecord(state, "scene", value, "second");
		expect(state.adventures[0].scenes.map((scene) => scene.id)).toEqual(["end"]);
		expect(state.adventures[0].links).toEqual([]);
		expect(state.adventures[1].scenes[1].position).not.toEqual({ x: 0, y: 0 });
		expect(state.activeAdventureId).toBe("second");
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
