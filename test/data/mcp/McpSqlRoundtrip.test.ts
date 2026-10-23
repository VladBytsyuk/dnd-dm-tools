// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { McpEntities, type McpRepository } from "src/data/mcp/McpEntities";
import { MCP_REFERENCE_KINDS, mcpEntitySchemas, mcpEntityTemplates, type McpReferenceKind } from "src/data/mcp/McpEntitySchemas";
import { createDefaultMediaState } from "src/domain/models/media/MediaState";
import type DB from "src/data/database/DB";
import { MediaSqlDao } from "src/data/database/MediaSqlDao";
import { MediaStore } from "src/data/stores/MediaStore";
import { DbTransactionalStore } from "src/data/stores/genericSqlStores";
import { EntityOriginDao } from "src/data/database/EntityOriginDao";
import { SmallMonsterSqlTableDao } from "src/data/database/SmallMonsterSqlTableDao";
import { FullMonsterSqlTableDao } from "src/data/database/FullMonsterSqlTableDao";
import { SmallSpellSqlTableDao } from "src/data/database/SmallSpellSqlTableDao";
import { FullSpellSqlTableDao } from "src/data/database/FullSpellSqlTableDao";
import { SmallWeaponSqlTableDao } from "src/data/database/SmallWeaponSqlTableDao";
import { FullWeaponSqlTableDao } from "src/data/database/FullWeaponSqlTableDao";
import { SmallArmorSqlTableDao } from "src/data/database/SmallArmorSqlTableDao";
import { FullArmorSqlTableDao } from "src/data/database/FullArmorSqlTableDao";
import { SmallItemSqlTableDao } from "src/data/database/SmallItemSqlTableDao";
import { FullItemSqlTableDao } from "src/data/database/FullItemSqlTableDao";
import { SmallArtifactSqlTableDao } from "src/data/database/SmallArtifactSqlTableDao";
import { FullArtifactSqlTableDao } from "src/data/database/FullArtifactSqlTableDao";
import { SmallBackgroundSqlTableDao } from "src/data/database/SmallBackgroundSqlTableDao";
import { FullBackgroundSqlTableDao } from "src/data/database/FullBackgroundSqlTableDao";
import { SmallFeatSqlTableDao } from "src/data/database/SmallFeatSqlTableDao";
import { FullFeatSqlTableDao } from "src/data/database/FullFeatSqlTableDao";
import { SmallRaceSqlTableDao } from "src/data/database/SmallRaceSqlTableDao";
import { FullRaceSqlTableDao } from "src/data/database/FullRaceSqlTableDao";
import { createBestiaryRepository, createSpellbookRepository, createArsenalRepository, createArmoryRepository, createEquipmentRepository, createArtifactoryRepository, createBackgroundRepository, createFeatsRepository, createRacesRepository } from "src/data/repositories/factories";

async function fixture() {
	const SQL = await initSqlJs({ wasmBinary: readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm")) });
	const sql = new SQL.Database();
	const dao = {
		smallMonsterDao: new SmallMonsterSqlTableDao(sql, {} as never, {} as never), fullMonsterDao: new FullMonsterSqlTableDao(sql),
		smallSpellDao: new SmallSpellSqlTableDao(sql, {} as never, {} as never), fullSpellDao: new FullSpellSqlTableDao(sql),
		smallWeaponDao: new SmallWeaponSqlTableDao(sql, {} as never, {} as never), fullWeaponDao: new FullWeaponSqlTableDao(sql),
		smallArmorDao: new SmallArmorSqlTableDao(sql, {} as never, {} as never), fullArmorDao: new FullArmorSqlTableDao(sql),
		smallItemDao: new SmallItemSqlTableDao(sql, {} as never, {} as never), fullItemDao: new FullItemSqlTableDao(sql),
		smallArtifactDao: new SmallArtifactSqlTableDao(sql, {} as never, {} as never), fullArtifactDao: new FullArtifactSqlTableDao(sql),
		smallBackgroundDao: new SmallBackgroundSqlTableDao(sql, {} as never, {} as never), fullBackgroundDao: new FullBackgroundSqlTableDao(sql),
		smallFeatDao: new SmallFeatSqlTableDao(sql, {} as never, {} as never), fullFeatDao: new FullFeatSqlTableDao(sql),
		smallRaceDao: new SmallRaceSqlTableDao(sql, {} as never, {} as never), fullRaceDao: new FullRaceSqlTableDao(sql),
	};
	for (const table of Object.values(dao)) await table.createTable();
	const entityOriginDao = new EntityOriginDao(sql); await entityOriginDao.initialize();
	const db = { ...dao, entityOriginDao, transaction: async (callback: () => Promise<void>) => {
		sql.exec("BEGIN TRANSACTION;");
		try { await callback(); sql.exec("COMMIT;"); } catch (error) { sql.exec("ROLLBACK;"); throw error; }
	} } as unknown as DB;
	const repositories: Record<McpReferenceKind, McpRepository> = {
		bestiary: createBestiaryRepository(db), spellbook: createSpellbookRepository(db), arsenal: createArsenalRepository(db), armory: createArmoryRepository(db), equipment: createEquipmentRepository(db),
		artifactory: createArtifactoryRepository(db), backgrounds: createBackgroundRepository(db), feats: createFeatsRepository(db), races: createRacesRepository(db),
	};
	return { sql, db, repositories, gateway: new McpEntities({ repositories, getMediaState: createDefaultMediaState, updateMedia: async () => {} }) };
}

describe("MCP templates through real SQL DAOs and repository factories", () => {
	it.each(MCP_REFERENCE_KINDS)("creates, reads and updates a %s with stable persisted revisions", async (kind) => {
		const { gateway, sql } = await fixture();
		try {
			const created = await gateway.commit(await gateway.prepareCreate(kind, structuredClone(mcpEntityTemplates[kind])));
			const read = await gateway.getEntity(kind, created.url);
			expect(created.revision).toBe(read.revision);
			expect(read.data.origin).toBe("manual");
			expect(mcpEntitySchemas[kind].safeParse(read.data).success).toBe(true);
			const operation = await gateway.prepareUpdate(kind, read.url, { ...read.data, description: "Изменено через MCP" }, read.revision);
			const updated = await gateway.commit(operation);
			const reread = await gateway.getEntity(kind, read.url);
			expect(updated.revision).toBe(reread.revision);
			expect(updated.copied).toBe(false);
			expect(reread.data.description).toBe("Изменено через MCP");
		} finally { sql.close(); }
	});
});


it("persists vault audio, track and playlist together and rolls back a failed track save", async () => {
	const { sql, db, repositories } = await fixture();
	const SQL = await initSqlJs({ wasmBinary: readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm")) });
	const dao = new MediaSqlDao(sql); dao.initialize();
	const store = new MediaStore(dao, new DbTransactionalStore(db));
	let media = store.read();
	const vaultFiles = ["Music/adventure_begins_loop.mp3", "Music/other.wav"];
	let removeBeforeWrite = false;
	const gateway = new McpEntities({ repositories, getMediaState: () => media, getVaultAudioPaths: () => vaultFiles,
		updateMedia: async (mutator, beforeWrite) => {
			const next = structuredClone(media); mutator(next);
			if (removeBeforeWrite) vaultFiles.length = 0;
			await store.save(next, beforeWrite); media = next;
		} });
	try {
		const path = vaultFiles[0];
		await gateway.commit(await gateway.prepareCreate("track", { ...structuredClone(mcpEntityTemplates.track), normalAudioPath: path }));
		await gateway.commit(await gateway.prepareCreate("playlist", { ...structuredClone(mcpEntityTemplates.playlist), items: [{ id: "music", trackId: "new-id" }] }));
		await gateway.commit(await gateway.prepareCreate("scene", { ...structuredClone(mcpEntityTemplates.scene), trackId: "new-id" }));
		await gateway.commit(await gateway.prepareCreate("adventure", { ...structuredClone(mcpEntityTemplates.adventure), playlistId: "new-id", scenes: [{ id: "new-id", position: { x: 0, y: 0 } }] }));
		const persisted = new SQL.Database(sql.export());
		try {
			const reopened = new MediaSqlDao(persisted).read();
			expect(reopened.audioFiles[0].path).toBe(path);
			expect(reopened.tracks[0].normalAudioId).toBe(reopened.audioFiles[0].id);
			expect(reopened.playlists[0].items[0].trackId).toBe(reopened.tracks[0].id);
			expect(reopened.scenes[0].trackId).toBe(reopened.tracks[0].id);
			expect(reopened.adventures[0].playlistId).toBe(reopened.playlists[0].id);
		} finally { persisted.close(); }
		const before = store.read(), memoryBefore = structuredClone(media);
		sql.exec("CREATE TRIGGER reject_track BEFORE INSERT ON media_entities WHEN NEW.kind = 'tracks' BEGIN SELECT RAISE(ABORT, 'simulated storage failure'); END;");
		await expect(gateway.commit(await gateway.prepareCreate("track", { ...structuredClone(mcpEntityTemplates.track), id: "other", url: "/track/other", normalAudioPath: vaultFiles[1] }))).rejects.toThrow("simulated storage failure");
		expect(store.read()).toEqual(before); expect(media).toEqual(memoryBefore);
		sql.exec("DROP TRIGGER reject_track;");
		const disappearing = await gateway.prepareCreate("track", { ...structuredClone(mcpEntityTemplates.track), id: "other", url: "/track/other", normalAudioPath: vaultFiles[1] });
		removeBeforeWrite = true;
		await expect(gateway.commit(disappearing)).rejects.toThrow("Аудиофайл");
		expect(store.read()).toEqual(before); expect(media).toEqual(memoryBefore);
	} finally { sql.close(); }
});
