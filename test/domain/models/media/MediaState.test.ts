import { describe, expect, it } from "vitest";
import { updateVaultFilePath, loadMediaState, createMediaTrack, createMediaScene, createMediaAdventure, removeMediaTrack, removeAdventure, removeAdventureScene } from "src/domain/models/media/MediaState";
import { sampleMedia, legacyMedia, ownedMedia } from "../../../fixtures/media";
import { saveMediaRecord, removeMediaRecord, mediaItems, mediaCampaignName, findMediaItem } from "src/domain/models/media/MediaLibrary";

describe("shared media scenes and migration", () => {
	it("migrates legacy audio and scenes into independent records with graph references", () => {
		const media = sampleMedia();
		expect(media.tracks).toHaveLength(3);
		expect(media.tracks.map((track) => track.loop)).toEqual([true, false, true]);
		expect(media.playlists.map((list) => list.items.length)).toEqual([1, 1]);
		expect(media.adventures[0].playlistId).toBe("music");
		expect(media.scenes[0]).toMatchObject({ id: "start", name: "Start", notePath: "Scenes/Start.md", trackId: media.playlists[1].items[0].trackId });
		expect(media.adventures[0].scenes[0]).toEqual({ id: "start", position: { x: 0, y: 0 } });
		expect(loadMediaState(JSON.parse(JSON.stringify(media)))).toEqual(media);
		expect(createMediaTrack().loop).toBe(true);
		expect(legacyMedia().adventures[0].scenes[0].path).toBe("Scenes/Start.md");
	});
	it("extracts version six scenes preserving IDs, URLs, effective campaigns, music, positions and arrows", () => {
		const old = ownedMedia(); old.adventures[0].campaignName = "Культ";
		old.adventures[0].scenes[0].campaignName = "Скрытое старое значение";
		const solo = { ...createMediaScene("Таверна", "solo"), campaignName: "Своя", position: { x: 0, y: 0 } };
		const migrated = loadMediaState({ ...old, standaloneScenes: [solo] });
		expect(migrated.scenes).toHaveLength(3);
		const { position, ...oldScene } = old.adventures[0].scenes[0];
		expect(migrated.scenes.find((scene) => scene.id === "start")).toEqual({ ...oldScene, campaignName: "Культ" });
		expect(migrated.scenes.find((scene) => scene.id === "solo")?.campaignName).toBe("Своя");
		expect(migrated.adventures[0].scenes.map((reference) => reference.position)).toEqual(old.adventures[0].scenes.map((scene) => scene.position));
		expect(migrated.adventures[0].links).toEqual(old.adventures[0].links);
		expect(migrated.activeAdventureId).toBe("quest");
		expect(migrated.activeSceneId).toBe("start");
		expect(loadMediaState(migrated)).toEqual(migrated);
	});
	it("preserves scenes without notes, shared note paths and parallel arrows through reload", () => {
		const media = sampleMedia(), scene = createMediaScene("Без заметки", "empty");
		media.scenes.push(scene);
		media.adventures[0].scenes.push({ id: scene.id, position: { x: 500, y: 300 } });
		media.scenes[1].notePath = media.scenes[0].notePath;
		media.adventures[0].links.push({ ...media.adventures[0].links[0], id: "parallel", fromSide: "top", toSide: "right" });
		expect(loadMediaState(media)).toEqual(media);
	});
	it("shares the same scene across adventures and updates its metadata everywhere", () => {
		const state = sampleMedia(), scene = structuredClone(state.scenes[0]), second = createMediaAdventure("Второй", "second");
		second.scenes = [{ id: scene.id, position: { x: 900, y: 450 } }];
		saveMediaRecord(state, "adventure", second);
		expect(state.adventures[0].scenes[0].id).toBe(scene.id);
		expect(state.adventures[0].links).toHaveLength(1);
		scene.name = "Общая сцена"; scene.campaignName = "Своя кампания";
		saveMediaRecord(state, "scene", scene);
		const item = findMediaItem(state, { kind: "scene", id: scene.id })!;
		expect(item.adventures?.map((adventure) => adventure.id)).toEqual(["quest", "second"]);
		expect(mediaCampaignName(item)).toBe("Своя кампания");
		expect(mediaItems(state).filter((item) => item.mediaRoute.kind === "scene" && item.record.id === scene.id)).toHaveLength(1);
		expect(state.adventures[0].scenes[0].position).toEqual({ x: 0, y: 0 });
		expect(state.adventures[1].scenes[0].position).toEqual({ x: 900, y: 450 });
		expect(loadMediaState(state)).toEqual(state);
	});
	it("adds a newly saved scene to an adventure without changing other memberships", () => {
		const state = sampleMedia(), scene = createMediaScene("Новая", "new");
		saveMediaRecord(state, "scene", scene, "quest");
		saveMediaRecord(state, "scene", scene, "quest");
		expect(state.scenes.filter((entry) => entry.id === scene.id)).toEqual([scene]);
		expect(state.adventures[0].scenes.filter((entry) => entry.id === scene.id)).toHaveLength(1);
		expect(state.adventures[0].scenes.at(-1)?.position).not.toEqual({ x: 0, y: 0 });
	});
	it("removes graph membership and adventures without deleting the shared scene", () => {
		const state = sampleMedia(), second = createMediaAdventure("Второй", "second");
		second.scenes = [{ id: "start", position: { x: 800, y: 100 } }];
		state.adventures.push(second);
		const removed = removeAdventureScene(state, "quest", "start");
		expect(removed.adventures[0].scenes.map((scene) => scene.id)).toEqual(["end"]);
		expect(removed.adventures[0].links).toEqual([]);
		expect(removed.scenes).toEqual(state.scenes);
		expect(removed.adventures[1].scenes).toEqual(second.scenes);
		expect(removed.activeSceneId).toBe("start");
		expect(removed.activeAdventureId).toBeNull();
		expect(removeAdventure(state, "quest").scenes).toEqual(state.scenes);
		removeMediaRecord(state, { kind: "adventure", id: "quest" });
		expect(state.scenes).toHaveLength(2);
		expect(state.activeSceneId).toBe("start");
	});
	it("deletes the shared record and references and arrows in every adventure", () => {
		const state = sampleMedia(), second = { ...structuredClone(state.adventures[0]), id: "second", url: "/adventure/second" };
		state.adventures.push(second);
		removeMediaRecord(state, { kind: "scene", id: "start" });
		expect(state.scenes.map((scene) => scene.id)).toEqual(["end"]);
		for (const adventure of state.adventures) {
			expect(adventure.scenes.map((scene) => scene.id)).toEqual(["end"]);
			expect(adventure.links).toEqual([]);
		}
		expect(state.activeSceneId).toBeNull();
	});
	it("rejects missing or duplicate references before mutating state", () => {
		const state = sampleMedia(), before = structuredClone(state);
		expect(() => saveMediaRecord(state, "scene", createMediaScene(), "missing")).toThrow("Приключение не найдено");
		expect(() => saveMediaRecord(state, "adventure", { ...state.adventures[0], scenes: [{ id: "missing", position: { x: 0, y: 0 } }] })).toThrow();
		expect(() => saveMediaRecord(state, "adventure", { ...state.adventures[0], scenes: [state.adventures[0].scenes[0], state.adventures[0].scenes[0]] })).toThrow();
		expect(state).toEqual(before);
	});
	it("updates shared note paths once and clears deleted track references", () => {
		const state = sampleMedia(); state.adventures[0].notePath = "Scenes/Adventure.md";
		const moved = updateVaultFilePath(state, "Scenes", "New");
		expect(moved.adventures[0].notePath).toBe("New/Adventure.md");
		expect(moved.scenes[0]).toMatchObject({ id: "start", name: "Start", notePath: "New/Start.md" });
		expect(state.scenes[0].notePath).toBe("Scenes/Start.md");
		const trackId = state.scenes[0].trackId!;
		expect(removeMediaTrack(state, trackId).scenes[0].trackId).toBeNull();
		removeMediaRecord(state, { kind: "track", id: trackId });
		expect(state.scenes[0].trackId).toBeNull();
		expect(state.audioFiles).toHaveLength(3);
	});
});
