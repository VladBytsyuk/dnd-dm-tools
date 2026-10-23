import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { MediaSqlDao } from "src/data/database/MediaSqlDao";
import { MediaStore } from "src/data/stores/MediaStore";
import { sampleMedia } from "../../fixtures/media";
import { createDefaultMediaState, createMediaAdventure } from "src/domain/models/media/MediaState";

const wasmBinary = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));

describe("MediaSqlDao and MediaStore", () => {
	it("retains media identities, shared scenes, ordered tracks and metadata after reopening", async () => {
		const SQL = await initSqlJs({ wasmBinary });
		const database = new SQL.Database(), dao = new MediaSqlDao(database);
		dao.initialize();
		expect(dao.read()).toEqual(createDefaultMediaState());
		const state = sampleMedia();
		state.adventures.push({ ...createMediaAdventure("Другая история", "second"), scenes: [...state.adventures[0].scenes] });
		state.playlists[0].items.push({ id: "repeated", trackId: state.playlists[0].items[0].trackId });
		dao.write(state);
		const reopened = new SQL.Database(database.export()), saved = new MediaSqlDao(reopened);
		saved.initialize();
		expect(saved.read()).toEqual(state);
		expect(reopened.exec("SELECT count(*) FROM media_entities;")[0].values[0][0]).toBe(
			state.adventures.length + state.scenes.length + state.tracks.length + state.playlists.length);
		expect(reopened.exec("SELECT data FROM media_state;")[0].values[0][0]).not.toContain('"adventures"');
		database.close(); reopened.close();
	});

	it("replaces entities atomically and detaches queued candidates from caller changes", async () => {
		const SQL = await initSqlJs({ wasmBinary });
		const database = new SQL.Database(), dao = new MediaSqlDao(database);
		dao.initialize();
		const state = sampleMedia();
		let release!: () => void;
		const gate = new Promise<void>((resolveGate) => { release = resolveGate; });
		const store = new MediaStore(dao, { async transaction(callback) { await gate; return callback(); } });
		const pending = store.save(state);
		state.tracks[0].name = "Changed after save";
		release(); await pending;
		expect(store.read().tracks[0].name).not.toBe("Changed after save");
		await store.save(createDefaultMediaState());
		expect(store.read()).toEqual(createDefaultMediaState());
		database.close();
	});
});
