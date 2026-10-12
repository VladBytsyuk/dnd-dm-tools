import { describe, expect, it } from "vitest";
import { updateVaultFilePath } from "src/domain/models/media/MediaState";
import { createDefaultMediaState } from "src/domain/models/media/MediaState";

describe("media vault references", () => {
	it("updates audio and scene paths after a folder is renamed", () => {
		const state = createDefaultMediaState();
		state.audioFiles.push({ id: "audio", path: "Old/music.mp3", alias: "Музыка" });
		state.adventures.push({
			id: "adventure", name: "Игра", playlistIds: [], links: [],
			scenes: [{ id: "scene", path: "Old/Scene.md", playlistId: null, itemId: null }],
		});
		const moved = updateVaultFilePath(state, "Old", "New");
		expect(moved.audioFiles[0].path).toBe("New/music.mp3");
		expect(moved.adventures[0].scenes[0].path).toBe("New/Scene.md");
		expect(state.audioFiles[0].path).toBe("Old/music.mp3");
	});
});
