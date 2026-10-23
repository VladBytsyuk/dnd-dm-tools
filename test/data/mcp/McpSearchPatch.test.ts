// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it, vi } from "vitest";
import { McpEntities, type McpRepository } from "src/data/mcp/McpEntities";
import { MCP_ENTITY_KINDS, MCP_REFERENCE_KINDS, mcpEntityTemplates, type McpReferenceKind } from "src/data/mcp/McpEntitySchemas";
import { createDefaultMediaState, createMediaAdventure, createMediaScene, createMediaTrack } from "src/domain/models/media/MediaState";
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import { SpellbookRepository } from "src/data/repositories/SpellbookRepository";
import { ArsenalRepository } from "src/data/repositories/ArsenalRepository";
import { ArmoryRepository } from "src/data/repositories/ArmoryRepository";
import { EquipmentRepository } from "src/data/repositories/EquipmentRepository";
import { ArtifactoryRepository } from "src/data/repositories/ArtifactoryRepository";
import { BackgroundRepository } from "src/data/repositories/BackgroundRepository";
import { FeatsRepository } from "src/data/repositories/FeatsRepository";
import { RacesRepository } from "src/data/repositories/RacesRepository";
import { SmallMonsterSqlTableDao } from "src/data/database/SmallMonsterSqlTableDao";
import { FullMonsterSqlTableDao } from "src/data/database/FullMonsterSqlTableDao";
import { EntityOriginDao } from "src/data/database/EntityOriginDao";
import { createBestiaryRepository } from "src/data/repositories/factories";
import type DB from "src/data/database/DB";

function harness() {
	let media = createDefaultMediaState();
	const files: string[] = [];
	const records = new Map<McpReferenceKind, Record<string, any>[]>(MCP_REFERENCE_KINDS.map(kind => [kind, [{
		...structuredClone(mcpEntityTemplates[kind]), origin: "manual", name: { rus: "Исходное имя", eng: "Original name" },
		source: { shortName: "PHB", name: "Книга игрока", group: { name: "Базовые правила", shortName: "Basic" } },
	}]]));
	Object.assign(records.get("bestiary")![0], { type: "зверь", challengeRating: "1/2", languages: ["Общий", "Эльфийский"] });
	Object.assign(records.get("spellbook")![0], { level: 3, school: "Воплощение" });
	Object.assign(records.get("arsenal")![0], { type: { name: "Рукопашное" }, damage: { dice: "1к8", type: "рубящий" } });
	Object.assign(records.get("armory")![0], { type: { name: "Лёгкая" } });
	Object.assign(records.get("artifactory")![0], { type: { name: "Кольцо" }, rarity: { type: "rare", name: "Редкий", short: "R" } });
	Object.assign(records.get("races")![0], { type: { name: "Базовые" }, abilities: [{ key: "str", name: "Сила", shortName: "СИЛ", value: 2 }] });
	const stores = Object.fromEntries(MCP_REFERENCE_KINDS.map(kind => [kind, {
		readAllSmallItems: vi.fn(async () => structuredClone(records.get(kind)!)),
		readFilteredSmallItems: vi.fn(async () => structuredClone(records.get(kind)!)),
		readSmallItemByUrl: vi.fn(async (url: string) => structuredClone(records.get(kind)!.find(item => item.url === url) ?? null)),
		readFullItemByUrl: vi.fn(async (url: string) => structuredClone(records.get(kind)!.find(item => item.url === url) ?? null)),
	}]));
	const dependencies = (kind: McpReferenceKind) => ({
		readStore: stores[kind],
		writeStore: { upsertUserItem: vi.fn(async (_small: unknown, full: Record<string, unknown>, beforeWrite?: () => Promise<void>) => {
			await beforeWrite?.();
			const list = records.get(kind)!, index = list.findIndex(item => item.url === full.url);
			if (index >= 0) list[index] = structuredClone(full);
			else list.push(structuredClone(full));
		}) },
		service: {}, mapper: {}, projector: { project: (item: unknown) => item },
	});
	const repositories: Record<McpReferenceKind, McpRepository> = {
		bestiary: new BestiaryRepository(dependencies("bestiary") as never),
		spellbook: new SpellbookRepository(dependencies("spellbook") as never),
		arsenal: new ArsenalRepository(dependencies("arsenal") as never),
		armory: new ArmoryRepository(dependencies("armory") as never),
		equipment: new EquipmentRepository(dependencies("equipment") as never),
		artifactory: new ArtifactoryRepository(dependencies("artifactory") as never),
		backgrounds: new BackgroundRepository(dependencies("backgrounds") as never),
		feats: new FeatsRepository(dependencies("feats") as never),
		races: new RacesRepository({ simpleDependencies: dependencies("races"), raceStore: {}, mapper: {}, service: {} } as never),
	};
	media.tracks.push(createMediaTrack("Трек", "track"));
	media.scenes.push({ ...createMediaScene("Сцена", "scene"), campaignName: "Равенлофт", trackId: "track" });
	media.adventures.push({ ...createMediaAdventure("Приключение", "adventure"), campaignName: "Равенлофт" });
	const gateway = new McpEntities({ repositories, getMediaState: () => media, getVaultAudioPaths: () => files,
		updateMedia: async (mutate, beforeWrite) => { const next = structuredClone(media); mutate(next); beforeWrite?.(); media = next; } });
	return { gateway, repositories, records, stores, files, get media() { return media; } };
}

describe("MCP filter discovery and search", () => {
	it.each(MCP_ENTITY_KINDS)("publishes filter metadata matching the existing %s repository", async (kind) => {
		const test = harness();
		const schema = await test.gateway.getEntitySchema(kind);
		const expected = MCP_REFERENCE_KINDS.includes(kind as McpReferenceKind)
			? await test.repositories[kind as McpReferenceKind].getAllFilters!()
			: kind === "adventure" || kind === "scene" ? { campaignNames: ["Равенлофт"] } : {};
		expect(schema.filterValues).toEqual(expected);
		expect(schema.filterSchema.additionalProperties).toBe(false);
		expect(Object.keys(schema.filterSchema.properties).sort()).toEqual(Object.keys(expected as object).sort());
		for (const [key, value] of Object.entries(schema.filterSchema.properties)) {
			expect(value).toEqual({ type: "array", items: { type: key === "levels" ? "number" : "string" } });
		}
	});

	it("uses the published challenge rating filter against the real SQL DAO", async () => {
		const SQL = await initSqlJs({ wasmBinary: readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm")) });
		const sql = new SQL.Database();
		try {
			const smallMonsterDao = new SmallMonsterSqlTableDao(sql, {} as never, {} as never);
			const fullMonsterDao = new FullMonsterSqlTableDao(sql);
			const entityOriginDao = new EntityOriginDao(sql);
			await smallMonsterDao.createTable(); await fullMonsterDao.createTable(); await entityOriginDao.initialize();
			for (const challengeRating of ["1/2", "5"]) await smallMonsterDao.createItem({ ...structuredClone(mcpEntityTemplates.bestiary), challengeRating, url: `/bestiary/cr-${challengeRating.replace("/", "-")}` } as never);
			const test = harness();
			test.repositories.bestiary = createBestiaryRepository({ smallMonsterDao, fullMonsterDao, entityOriginDao } as unknown as DB);
			const schema = await test.gateway.getEntitySchema("bestiary");
			expect(schema.filterValues).toMatchObject({ challengeRatings: ["1/2", "5"] });
			expect(schema.filterSchema.properties).not.toHaveProperty("challangeRatings");
			const result = await test.gateway.searchEntities("", ["bestiary"], 0, 20, { challengeRatings: ["1/2"] });
			expect(result.items.map(item => item.url)).toEqual(["/bestiary/cr-1-2"]);
		} finally { sql.close(); }
	});

	it("fills omitted domain filter arrays before calling repositories", async () => {
		const test = harness();
		await test.gateway.searchEntities("", ["spellbook"], 0, 20, { levels: [3] });
		expect(test.stores.spellbook.readFilteredSmallItems).toHaveBeenCalledWith(null, { levels: [3], schools: [], sources: [] });
	});

	it("filters media campaigns and combines filters with text search", async () => {
		const test = harness();
		test.media.scenes.push({ ...createMediaScene("Другая сцена", "other"), campaignName: "Другой мир" });
		expect((await test.gateway.searchEntities("сцена", ["scene"], 0, 20, { campaignNames: ["Равенлофт"] })).items.map(item => item.url)).toEqual(["/scene/scene"]);
		expect((await test.gateway.searchEntities("неизвестно", ["scene"], 0, 20, { campaignNames: ["Равенлофт"] })).items).toEqual([]);
	});

	it("rejects unsupported filters, wrong scalar types and ambiguous multiple kinds", async () => {
		const { gateway } = harness();
		await expect(gateway.searchEntities("", ["bestiary", "spellbook"], 0, 20, { sources: ["PHB"] })).rejects.toThrow();
		for (const filters of [{ unknown: ["x"] }, { challengeRatings: [1] }, { types: "зверь" }]) {
			await expect(gateway.searchEntities("", ["bestiary"], 0, 20, filters as never)).rejects.toThrow();
		}
		for (const value of [-1, 10, 1.5, "3"]) await expect(gateway.searchEntities("", ["spellbook"], 0, 20, { levels: [value] } as never)).rejects.toThrow();
		await expect(gateway.searchEntities("", ["track"], 0, 20, { campaignNames: ["Равенлофт"] })).rejects.toThrow();
	});
});

describe("MCP partial updates", () => {
	it("merges nested fields without changing unspecified values or writing before confirmation", async () => {
		const test = harness();
		const url = String(test.records.get("feats")![0].url);
		const read = await test.gateway.getEntity("feats", url);
		const operation = await test.gateway.preparePatch("feats", url, { name: { rus: "Новое имя" }, source: { group: { name: "Другая группа" } } }, read.revision);
		expect(operation.data).toMatchObject({ name: { rus: "Новое имя", eng: "Original name" }, source: { shortName: "PHB", name: "Книга игрока", group: { name: "Другая группа", shortName: "Basic" } } });
		expect(test.records.get("feats")![0].name.rus).toBe("Исходное имя");
		await test.gateway.commit(operation);
		expect((await test.gateway.getEntity("feats", url)).data.name).toEqual({ rus: "Новое имя", eng: "Original name" });
	});

	it("replaces arrays as complete values instead of merging their indices", async () => {
		const { gateway, records } = harness();
		const url = String(records.get("bestiary")![0].url), read = await gateway.getEntity("bestiary", url);
		await gateway.commit(await gateway.preparePatch("bestiary", url, { languages: ["Драконий"] }, read.revision));
		expect((await gateway.getEntity("bestiary", url)).data.languages).toEqual(["Драконий"]);
	});

	it("accepts null for nullable links and rejects null for required or optional non-null fields", async () => {
		const { gateway } = harness();
		const scene = await gateway.getEntity("scene", "/scene/scene");
		await gateway.commit(await gateway.preparePatch("scene", scene.url, { trackId: null }, scene.revision));
		expect((await gateway.getEntity("scene", scene.url)).data.trackId).toBeNull();
		const monster = await gateway.getEntity("bestiary", "/bestiary/manual-new-id");
		for (const changes of [{ name: null }, { description: null }, { languages: null }]) {
			await expect(gateway.preparePatch("bestiary", monster.url, changes, monster.revision)).rejects.toThrow();
		}
	});

	it("preserves immutable manual URLs and media IDs", async () => {
		const { gateway } = harness();
		const track = await gateway.getEntity("track", "/track/track");
		for (const changes of [{ id: "changed" }, { url: "/track/changed" }]) {
			await expect(gateway.preparePatch("track", track.url, changes, track.revision)).rejects.toThrow("неизменяемые");
		}
		const feat = await gateway.getEntity("feats", "/feats/manual-new-id");
		await expect(gateway.preparePatch("feats", feat.url, { url: "/feats/changed" }, feat.revision)).rejects.toThrow("неизменяемый");
	});

	it("rejects prototype pollution keys at every merged depth", async () => {
		const { gateway } = harness();
		const feat = await gateway.getEntity("feats", "/feats/manual-new-id");
		for (const json of ['{"__proto__":{"polluted":"yes"}}', '{"name":{"constructor":{"prototype":{"polluted":"yes"}}}}', '{"source":{"group":{"prototype":{"polluted":"yes"}}}}']) {
			await expect(gateway.preparePatch("feats", feat.url, JSON.parse(json), feat.revision)).rejects.toThrow();
			expect(({} as { polluted?: string }).polluted).toBeUndefined();
		}
	});

	it("requires a fresh revision and preserves newer data during confirmation", async () => {
		const test = harness();
		const feat = await test.gateway.getEntity("feats", "/feats/manual-new-id");
		await expect(test.gateway.preparePatch("feats", feat.url, { description: "new" }, "stale")).rejects.toThrow("заново");
		const operation = await test.gateway.preparePatch("feats", feat.url, { description: "agent" }, feat.revision);
		test.records.get("feats")![0].description = "Changed in Obsidian";
		await expect(test.gateway.commit(operation)).rejects.toThrow("изменилась");
		expect(test.records.get("feats")![0].description).toBe("Changed in Obsidian");
	});
});

describe("MCP audio search", () => {
	it("distinguishes existing, registered and missing paths without file contents", () => {
		const test = harness();
		test.media.audioFiles.push({ id: "present", path: "Music/combat.mp3", alias: "Тема боя" }, { id: "missing", path: "Music/deleted.wav", alias: "Удалённый файл" });
		test.files.push("Music/combat.mp3", "Music/new.ogg", "Music/new.ogg", "Notes/story.md", "../escape.mp3");
		const result = test.gateway.searchAudioAssets();
		expect(result.items).toHaveLength(3);
		expect(result.items).toEqual(expect.arrayContaining([
			{ id: "present", path: "Music/combat.mp3", alias: "Тема боя", exists: true, registered: true },
			{ id: "missing", path: "Music/deleted.wav", alias: "Удалённый файл", exists: false, registered: true },
			{ id: null, path: "Music/new.ogg", alias: "new", exists: true, registered: false },
		]));
		for (const item of result.items) expect(Object.keys(item).sort()).toEqual(["alias", "exists", "id", "path", "registered"]);
		expect(test.gateway.searchAudioAssets("ТЕМА").items.map(item => item.id)).toEqual(["present"]);
		expect(test.gateway.searchAudioAssets("music/NEW").items.map(item => item.path)).toEqual(["Music/new.ogg"]);
	});

	it("paginates audio matches with a default of twenty and a limit of one hundred", () => {
		const { gateway, files } = harness();
		for (let index = 0; index < 25; index++) files.push(`Music/track-${index.toString().padStart(2, "0")}.mp3`);
		const first = gateway.searchAudioAssets();
		expect(first).toMatchObject({ total: 25, offset: 0, limit: 20, hasMore: true });
		expect(first.items).toHaveLength(20);
		expect(gateway.searchAudioAssets("", 0, 100).items).toHaveLength(25);
		const second = gateway.searchAudioAssets("", 20);
		expect(second.items).toHaveLength(5);
		expect(second.hasMore).toBe(false);
		expect(second.items[0].path).toBe("Music/track-20.mp3");
		expect(gateway.searchAudioAssets("unknown").items).toEqual([]);
		for (const [offset, limit] of [[-1, 20], [0.5, 20], [0, 0], [0, 101]]) expect(() => gateway.searchAudioAssets("", offset, limit)).toThrow();
	});
});
