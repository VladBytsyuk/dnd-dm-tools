import { describe, expect, it } from "vitest";
import { createDefaultMediaState, createMediaScene, createMediaAdventure } from "src/domain/models/media/MediaState";
import { exportAdventureSnapshot, exportPlaylistSnapshot, exportMediaMarkdownBlock, importAdventureSnapshot, importPlaylistSnapshot, importTrackSnapshot, importSceneSnapshot, mediaSnapshotState, parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import { findMediaItem } from "src/domain/models/media/MediaLibrary";
import { sampleMedia, legacyMedia, ownedMedia } from "../../../fixtures/media";
function ids() { let id = 0; return () => `new-${++id}`; }

describe("media Markdown snapshots", () => {
	it.each(["track", "playlist", "scene", "adventure"] as const)("exports a self-contained %s block", (kind) => {
		const state = sampleMedia();
		const id = kind === "track" ? state.tracks[0].id : kind === "playlist" ? "music" : kind === "scene" ? "start" : "quest";
		const block = exportMediaMarkdownBlock(state, { kind, id });
		expect(block.startsWith(`\`\`\`${kind}\n`)).toBe(true);
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		const restored = mediaSnapshotState(snapshot);
		expect(findMediaItem(restored.media, restored.route)?.record).toEqual(findMediaItem(state, { kind, id })?.record);
		if (kind === "scene") expect(restored.media.adventures).toEqual([]);
	});
	it("imports a playlist copy and reuses audio paths while preserving track metadata", () => {
		const original = sampleMedia(); original.tracks[0].atmosphere = "тихая";
		const result = importPlaylistSnapshot(original, exportPlaylistSnapshot(original, "music"), ids(), () => true);
		expect(result.state.audioFiles).toHaveLength(3);
		expect(result.state.playlists).toHaveLength(3);
		const copied = result.state.playlists[2];
		expect(copied.id).not.toBe("music");
		expect(copied.url).not.toBe(original.playlists[0].url);
		expect(result.state.tracks.find((track) => track.id === copied.items[0].trackId)).toMatchObject({ normalAudioId: "calm", combatAudioId: "battle", loop: true, atmosphere: "тихая" });
		expect(result.missingPaths).toEqual([]);
	});
	it("roundtrips scene metadata and dependencies without creating an adventure", () => {
		const state = sampleMedia(), scene = createMediaScene("Засада", "solo");
		scene.campaignName = "Культ"; scene.notePath = "Scenes/Start.md"; scene.trackId = state.tracks[0].id;
		state.scenes.push(scene);
		const block = exportMediaMarkdownBlock(state, { kind: "scene", id: scene.id });
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		expect(snapshot).toMatchObject({ schemaVersion: 3, kind: "scene", scene });
		const restored = mediaSnapshotState(snapshot);
		expect(restored.media.adventures).toEqual([]);
		expect(restored.media.scenes).toEqual([scene]);
		expect(restored.media.tracks.map((track) => track.id)).toEqual([scene.trackId]);
	});
	it.each(["track", "scene"] as const)("imports a %s with remapped dependencies and reports missing files", (kind) => {
		const source = sampleMedia();
		source.scenes[0].trackId = source.tracks[0].id;
		source.scenes[0].campaignName = "Культ";
		const route = { kind, id: kind === "track" ? source.tracks[0].id : "start" };
		const json = exportMediaMarkdownBlock(source, route).split("\n").slice(1, -1).join("\n");
		const target = createDefaultMediaState(), before = structuredClone(target);
		const importer = kind === "track" ? importTrackSnapshot : importSceneSnapshot;
		const result = importer(target, json, ids(), () => false);
		const copied = findMediaItem(result.state, { kind, id: result.importedId })!.record;
		expect(copied).toMatchObject({ name: findMediaItem(source, route)!.record.name });
		expect(copied.id).not.toBe(route.id);
		expect(result.state.tracks).toHaveLength(1);
		const track = result.state.tracks[0];
		expect(track).toMatchObject({ loop: true, atmosphere: source.tracks[0].atmosphere });
		expect(result.state.audioFiles.find((file) => file.id === track.normalAudioId)?.path).toBe("Audio/calm.mp3");
		expect(result.state.audioFiles.find((file) => file.id === track.combatAudioId)?.path).toBe("Audio/battle.mp3");
		expect(result.missingPaths).toEqual(kind === "track" ? ["Audio/calm.mp3", "Audio/battle.mp3"] : ["Audio/calm.mp3", "Audio/battle.mp3", "Scenes/Start.md"]);
		if (kind === "scene") expect(result.state.scenes[0]).toMatchObject({ trackId: track.id, campaignName: "Культ", notePath: "Scenes/Start.md" });
		expect(result.state.scenes).toHaveLength(kind === "scene" ? 1 : 0);
		expect(result.state.playlists).toEqual([]);
		expect(result.state.adventures).toEqual([]);
		expect(target).toEqual(before);
		expect(() => importer(target, exportAdventureSnapshot(source, "quest"), ids(), () => true)).toThrow();
	});
	it.each([null, { id: "quest", name: "Поход", url: "/adventure/quest", campaignName: "Культ" }])("reads version two scene snapshots with parent %j", (adventure) => {
		const state = ownedMedia();
		const restored = mediaSnapshotState(parseMediaSnapshot(JSON.stringify({ schemaVersion: 2, kind: "scene", adventure, scene: state.adventures[0].scenes[0], tracks: state.tracks, audioFiles: state.audioFiles })));
		expect(restored.media.scenes[0]).toMatchObject({ id: "start", name: "Start", notePath: "Scenes/Start.md", campaignName: adventure ? "Культ" : "" });
		expect(restored.media.scenes[0]).not.toHaveProperty("position");
		expect(restored.media.adventures).toEqual([]);
	});
	it("reads old version two adventure snapshots and extracts scene records", () => {
		const state = ownedMedia(); state.adventures[0].campaignName = "Культ";
		const snapshot = parseMediaSnapshot(JSON.stringify({ schemaVersion: 2, kind: "adventure", adventure: state.adventures[0], playlists: state.playlists, tracks: state.tracks, audioFiles: state.audioFiles }));
		const restored = mediaSnapshotState(snapshot).media;
		expect(restored.scenes).toHaveLength(2);
		expect(restored.scenes[0].campaignName).toBe("Культ");
		expect(restored.adventures[0].scenes[0]).toEqual({ id: "start", position: state.adventures[0].scenes[0].position });
		expect(restored.adventures[0].links).toEqual(state.adventures[0].links);
	});
	it("imports independent scene copies, graph positions, no-note scenes and parallel arrows", () => {
		const original = sampleMedia(), adventure = original.adventures[0], blank = createMediaScene("Пустая", "blank");
		adventure.campaignName = "Культ";
		original.scenes.push(blank); adventure.scenes.push({ id: blank.id, position: { x: 800, y: 400 } });
		adventure.links.push({ ...adventure.links[0], id: "parallel", fromSide: "top", toSide: "left" });
		const result = importAdventureSnapshot(original, exportAdventureSnapshot(original, "quest"), ids(), (path) => path !== "Scenes/End.md");
		const copied = result.state.adventures[1];
		expect(copied.campaignName).toBe("Культ");
		expect(copied.playlistId).not.toBe(adventure.playlistId);
		expect(copied.scenes[0].id).not.toBe("start");
		expect(copied.scenes[2].position).toEqual({ x: 800, y: 400 });
		expect(result.state.scenes.find((scene) => scene.id === copied.scenes[2].id)?.notePath).toBeNull();
		expect(result.state.scenes.find((scene) => scene.id === copied.scenes[0].id)?.trackId).toBeTruthy();
		expect(copied.links[1]).toMatchObject({ fromSide: "top", toSide: "left", fromSceneId: copied.scenes[0].id, toSceneId: copied.scenes[1].id });
		expect(result.state.scenes).toHaveLength(6);
		expect(result.missingPaths).toEqual(["Scenes/End.md"]);
		expect(original.scenes).toHaveLength(3);
	});
	it("exports only the scenes referenced by the chosen adventure even when they are shared", () => {
		const state = sampleMedia(), second = createMediaAdventure("Второе", "second");
		second.scenes = [{ id: "start", position: { x: 900, y: 300 } }]; state.adventures.push(second);
		const snapshot = JSON.parse(exportAdventureSnapshot(state, "second"));
		expect(snapshot.scenes.map((scene: { id: string }) => scene.id)).toEqual(["start"]);
		expect(snapshot.adventure.scenes[0].position).toEqual({ x: 900, y: 300 });
		expect(snapshot.scenes[0]).not.toHaveProperty("position");
	});
	it("imports version one snapshots", () => {
		const old = legacyMedia();
		const result = importAdventureSnapshot(createDefaultMediaState(), JSON.stringify({ schemaVersion: 1, kind: "adventure", adventure: old.adventures[0], playlists: old.playlists, audioFiles: old.audioFiles }), ids(), () => true);
		expect(result.state.scenes[0].trackId).toBeTruthy();
		expect(result.state.tracks.map((track) => track.loop)).toEqual([true, false, true]);
	});
	it("rejects malformed, dangling and wrong-kind snapshots before mutation", () => {
		expect(() => parseMediaSnapshot("{bad json")).toThrow();
		const json = exportAdventureSnapshot(sampleMedia(), "quest");
		expect(() => importPlaylistSnapshot(createDefaultMediaState(), json, ids(), () => true)).toThrow();
		const bad = JSON.parse(json); bad.adventure.links[0].toSceneId = "missing";
		expect(() => parseMediaSnapshot(JSON.stringify(bad))).toThrow();
		const missing = JSON.parse(json); missing.scenes = [];
		expect(() => parseMediaSnapshot(JSON.stringify(missing))).toThrow();
	});
});
