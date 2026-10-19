import { describe, expect, it } from "vitest";
import { createDefaultMediaState, createMediaScene } from "src/domain/models/media/MediaState";
import { exportAdventureSnapshot, exportPlaylistSnapshot, exportMediaMarkdownBlock, importAdventureSnapshot, importPlaylistSnapshot, mediaSnapshotState, parseMediaSnapshot } from "src/domain/models/media/MediaSnapshot";
import { findMediaItem } from "src/domain/models/media/MediaLibrary";
import { sampleMedia, legacyMedia } from "../../../fixtures/media";
function ids() { let id = 0; return () => `new-${++id}`; }

describe("media Markdown snapshots", () => {
	it.each(["track", "playlist", "scene", "adventure"] as const)("always exports a self-contained %s block", (kind) => {
		const state = sampleMedia();
		const id = kind === "track" ? state.tracks[0].id : kind === "playlist" ? "music" : kind === "scene" ? "start" : "quest";
		const block = exportMediaMarkdownBlock(state, { kind, id });
		expect(block.startsWith(`\`\`\`${kind}\n`)).toBe(true);
		expect(block.endsWith("\n```" )).toBe(true);
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		expect(snapshot.kind).toBe(kind);
		const restored = mediaSnapshotState(snapshot);
		expect(findMediaItem(restored.media, restored.route)?.record).toEqual(findMediaItem(state, { kind, id })?.record);
		if (kind === "scene") expect(findMediaItem(restored.media, restored.route)?.parent?.name).toBe("Поход");
	});
	it("imports an independent playlist copy, reuses audio paths and preserves track metadata", () => {
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
	it("roundtrips a standalone scene with its campaign and dependencies without an adventure", () => {
		const state = sampleMedia(), scene = createMediaScene("Засада", "solo");
		scene.campaignName = "Культ"; scene.notePath = "Scenes/Start.md"; scene.trackId = state.tracks[0].id;
		state.standaloneScenes.push(scene);
		const block = exportMediaMarkdownBlock(state, { kind: "scene", id: scene.id });
		const snapshot = parseMediaSnapshot(block.split("\n").slice(1, -1).join("\n"));
		expect(snapshot).toMatchObject({ kind: "scene", adventure: null, scene });
		const restored = mediaSnapshotState(snapshot);
		expect(restored.media.adventures).toEqual([]);
		expect(restored.media.standaloneScenes).toEqual([scene]);
		expect(restored.media.tracks.map((track) => track.id)).toEqual([scene.trackId]);
		expect(findMediaItem(restored.media, restored.route)?.parent).toBeUndefined();
		const bad = JSON.parse(block.split("\n").slice(1, -1).join("\n")); bad.scene.trackId = "missing";
		expect(() => parseMediaSnapshot(JSON.stringify(bad))).toThrow();
	});
	it("preserves inherited campaigns and reads older version two scene blocks", () => {
		const state = sampleMedia(); state.adventures[0].campaignName = "Культ";
		const block = exportMediaMarkdownBlock(state, { kind: "scene", id: "start" });
		const raw = JSON.parse(block.split("\n").slice(1, -1).join("\n"));
		expect(mediaSnapshotState(parseMediaSnapshot(JSON.stringify(raw))).media.adventures[0].campaignName).toBe("Культ");
		delete raw.adventure.campaignName; delete raw.scene.campaignName;
		const restored = mediaSnapshotState(parseMediaSnapshot(JSON.stringify(raw)));
		expect(restored.media.adventures[0].name).toBe("Поход");
		expect(restored.media.adventures[0].scenes[0].campaignName).toBe("");
	});
	it("roundtrips adventure metadata, scene-only tracks, no-note scenes, positions and parallel arrows", () => {
		const original = sampleMedia(), adventure = original.adventures[0]; adventure.campaignName = "Культ";
		adventure.scenes.push(createMediaScene("Пустая", "blank"));
		adventure.links.push({ ...adventure.links[0], id: "parallel", fromSide: "top", toSide: "left" });
		const result = importAdventureSnapshot(createDefaultMediaState(), exportAdventureSnapshot(original, "quest"), ids(), (path) => path !== "Scenes/End.md");
		const copied = result.state.adventures[0];
		expect(copied.campaignName).toBe("Культ");
		expect(copied.playlistId).toBe(result.state.playlists[0].id);
		expect(copied.scenes[0].trackId).toBeTruthy();
		expect(copied.scenes[2].notePath).toBeNull();
		expect(copied.scenes[1].position).toEqual(adventure.scenes[1].position);
		expect(copied.links).toHaveLength(2);
		expect(copied.links[1]).toMatchObject({ fromSide: "top", toSide: "left", fromSceneId: copied.scenes[0].id, toSceneId: copied.scenes[1].id });
		expect(copied.links[0].id).not.toBe(copied.links[1].id);
		expect(result.missingPaths).toEqual(["Scenes/End.md"]);
	});
	it("imports version one snapshots", () => {
		const old = legacyMedia();
		const result = importAdventureSnapshot(createDefaultMediaState(), JSON.stringify({ schemaVersion: 1, kind: "adventure", adventure: old.adventures[0], playlists: old.playlists, audioFiles: old.audioFiles }), ids(), () => true);
		expect(result.state.adventures[0].scenes[0].trackId).toBeTruthy();
		expect(result.state.tracks.map((track) => track.loop)).toEqual([true, false, true]);
	});
	it("rejects malformed, dangling and wrong-kind snapshots before mutation", () => {
		expect(() => parseMediaSnapshot("{bad json")).toThrow();
		const json = exportAdventureSnapshot(sampleMedia(), "quest");
		expect(() => importPlaylistSnapshot(createDefaultMediaState(), json, ids(), () => true)).toThrow();
		const bad = JSON.parse(json); bad.adventure.links[0].toSceneId = "missing";
		expect(() => parseMediaSnapshot(JSON.stringify(bad))).toThrow();
	});
});
