import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it, vi } from "vitest";
import DB from "src/data/database/DB";
import { MediaSqlDao } from "src/data/database/MediaSqlDao";
import { createDefaultMediaState, createMediaTrack } from "src/domain/models/media/MediaState";
import { mockManifest } from "../../__mocks__/data";
import { DbTransactionalStore, GenericSqlItemWriteStore } from "src/data/stores";
import { smallSpellFireball } from "../../__mocks__/domain/models/spell/small_spell_items";
import { fullSpellFireball } from "../../__mocks__/domain/models/spell/full_spell_items";

const wasm = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));

async function fixture() {
	let persisted: ArrayBuffer | undefined, failWrites = false;
	const adapter = {
		exists: vi.fn(async () => false),
		readBinary: vi.fn(async () => wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength)),
		writeBinary: vi.fn(async (_path: string, data: ArrayBuffer) => {
			if (failWrites) throw new Error("Disk full");
			persisted = data.slice(0);
		}),
	};
	const db = new DB({ vault: { configDir: ".obsidian", adapter } } as any, mockManifest);
	vi.spyOn(db as any, "createSeedOrchestrator").mockReturnValue({ seedAll: async () => undefined });
	await db.initialize();
	return { db, adapter, persisted: () => persisted!, failWrites: (value: boolean) => { failWrites = value; } };
}

describe("DB transactions", () => {
	it("keeps the read barrier closed until committed data has been persisted", async () => {
		const { db, adapter } = await fixture();
		let release!: () => void;
		const gate = new Promise<void>(resolveGate => { release = resolveGate; });
		adapter.writeBinary.mockImplementationOnce(async () => { await gate; });
		const saving = db.favorites.set("bestiary", "/persisting", true);
		let idle = false;
		const barrier = db.whenIdle().then(() => { idle = true; });
		await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
		expect(idle).toBe(false);
		release(); await Promise.all([saving, barrier]);
		expect(idle).toBe(true);
		await db.dispose();
	});

	it("cancels a queued media write before its transaction and preserves the persisted library", async () => {
		const { db, persisted } = await fixture();
		const initial = createDefaultMediaState();
		initial.tracks = [createMediaTrack("Saved", "saved")];
		await db.media.save(initial);
		let release!: () => void;
		const gate = new Promise<void>((resolveGate) => { release = resolveGate; });
		const prior = db.transaction(async () => { await gate; });
		let active = true;
		const guard = vi.fn(() => { if (!active) throw new Error("MCP cancelled"); });
		const candidate = { ...initial, tracks: [...initial.tracks, createMediaTrack("Cancelled", "cancelled")] };
		const write = db.media.save(candidate, guard);
		const rejected = expect(write).rejects.toThrow("MCP cancelled");
		expect(guard).not.toHaveBeenCalled();
		active = false;
		release(); await Promise.all([prior, rejected]);
		expect(guard).toHaveBeenCalledOnce();
		expect(db.media.read()).toEqual(initial);
		await db.favorites.set("bestiary", "/next-save", true);
		const SQL = await initSqlJs({ wasmBinary: wasm });
		const reopened = new SQL.Database(new Uint8Array(persisted()));
		expect(new MediaSqlDao(reopened).read()).toEqual(initial);
		reopened.close(); await db.dispose();
	});

	it("revalidates guarded writes after earlier queued UI edits and leaves the newer value intact", async () => {
		const { db } = await fixture();
		const store = new GenericSqlItemWriteStore(db.smallSpellDao, db.fullSpellDao, new DbTransactionalStore(db));
		await store.upsertUserItem(smallSpellFireball, fullSpellFireball);
		let release!: () => void;
		const gate = new Promise<void>((resolveGate) => { release = resolveGate; });
		const prior = db.transaction(async () => { await gate; });
		const uiFull = { ...fullSpellFireball, name: { rus: "Изменено в UI", eng: "UI edit" } };
		const uiSave = store.upsertUserItem({ ...smallSpellFireball, name: uiFull.name }, uiFull);
		const guarded = store.upsertUserItem(smallSpellFireball, fullSpellFireball, async () => {
			const current = await db.fullSpellDao.readItemByUrl(fullSpellFireball.url);
			if (current?.name.rus !== fullSpellFireball.name.rus) throw new Error("Concurrent edit");
		});
		const rejected = expect(guarded).rejects.toThrow("Concurrent edit");
		release(); await Promise.all([prior, uiSave, rejected]);
		expect((await db.fullSpellDao.readItemByUrl(fullSpellFireball.url))?.name).toEqual(uiFull.name);
		expect((await db.smallSpellDao.readItemByUrl(fullSpellFireball.url))?.name).toEqual(uiFull.name);
		await db.dispose();
	});

	it("serializes concurrent transactions, including persistence, and drains before disposal", async () => {
		const { db } = await fixture();
		let release!: () => void;
		const gate = new Promise<void>((resolveGate) => { release = resolveGate; });
		const order: string[] = [];
		const first = db.transaction(async () => { order.push("first start"); await gate; order.push("first end"); });
		const second = db.transaction(async () => { order.push("second"); });
		await Promise.resolve();
		expect(order).toEqual(["first start"]);
		const disposal = db.dispose();
		await expect(db.transaction(async () => undefined)).rejects.toThrow("closing");
		release(); await Promise.all([first, second, disposal]);
		expect(order).toEqual(["first start", "first end", "second"]);
	});

	it("restores every DAO after disk failure so subsequent commits cannot persist rejected writes", async () => {
		const { db, failWrites, persisted } = await fixture();
		const initial = createDefaultMediaState();
		initial.tracks = [createMediaTrack("Saved", "saved")];
		await db.media.save(initial);
		failWrites(true);
		const rejected = { ...initial, tracks: [...initial.tracks, createMediaTrack("Rejected", "rejected")] };
		await expect(db.media.save(rejected)).rejects.toThrow("Disk full");
		expect(db.media.read()).toEqual(initial);
		failWrites(false);
		await db.favorites.set("bestiary", "/committed", true);
		expect(db.favorites.has("bestiary", "/committed")).toBe(true);
		const SQL = await initSqlJs({ wasmBinary: wasm });
		const reopened = new SQL.Database(new Uint8Array(persisted()));
		expect(new MediaSqlDao(reopened).read()).toEqual(initial);
		reopened.close(); await db.dispose();
	});

	it("rolls back failed callbacks without poisoning the transaction queue", async () => {
		const { db } = await fixture();
		await expect(db.transaction(async () => {
			db.favoritesDao.add("bestiary", "/rejected");
			throw new Error("Rejected");
		})).rejects.toThrow("Rejected");
		expect(db.favorites.has("bestiary", "/rejected")).toBe(false);
		await db.favorites.set("bestiary", "/accepted", true);
		expect(db.favorites.has("bestiary", "/accepted")).toBe(true);
		await db.dispose();
	});

	it("propagates initialization failures", async () => {
		const { db, adapter } = await fixture();
		await db.dispose();
		const broken = new DB({ vault: { configDir: ".obsidian", adapter: { ...adapter, exists: async () => { throw new Error("Cannot read vault"); } } } } as any, mockManifest);
		await expect(broken.initialize()).rejects.toThrow("Cannot read vault");
	});
});
