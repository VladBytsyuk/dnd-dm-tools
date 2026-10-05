import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { FavoritesDao } from "src/data/database/FavoritesDao";
import { FavoritesStore } from "src/data/stores/FavoritesStore";
import { SmallSpellSqlTableDao } from "src/data/database/SmallSpellSqlTableDao";
import { DmScreenGroupSqlTableDao } from "src/data/database/DmScreenGroupSqlTableDao";
import { mockApp, mockManifest } from "../../__mocks__/data";
import { smallSpellAwaken, smallSpellFireball, smallSpellWish } from "../../__mocks__/domain/models/spell/small_spell_items";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";

const wasmBinary = readFileSync(resolve("node_modules/sql.js/dist/sql-wasm.wasm"));

describe("FavoritesDao", () => {
	it("persists independent favorites per entity kind", async () => {
		const SQL = await initSqlJs({ wasmBinary });
		const database = new SQL.Database();
		const dao = new FavoritesDao(database);
		dao.initialize();
		const store = new FavoritesStore(dao, {
			async transaction(callback) {
				database.exec("BEGIN TRANSACTION");
				try {
					const result = await callback();
					database.exec("COMMIT");
					return result;
				} catch (error) {
					database.exec("ROLLBACK");
					throw error;
				}
			},
		});

		await store.set("spellbook", "/shared", true);
		await store.set("bestiary", "/shared", true);
		await store.set("spellbook", "/shared", true);
		expect(store.listUrls("spellbook")).toEqual(["/shared"]);
		expect(store.has("bestiary", "/shared")).toBe(true);

		const reopened = new SQL.Database(database.export());
		const saved = new FavoritesDao(reopened);
		saved.initialize();
		expect(saved.has("spellbook", "/shared")).toBe(true);
		expect(saved.has("bestiary", "/shared")).toBe(true);

		await store.set("spellbook", "/shared", false);
		expect(store.has("spellbook", "/shared")).toBe(false);
		expect(store.has("bestiary", "/shared")).toBe(true);
		database.close();
		reopened.close();
	});

	it("loads filtered favorites beyond the first page", async () => {
		const SQL = await initSqlJs({ wasmBinary });
		const database = new SQL.Database();
		const spellDao = new SmallSpellSqlTableDao(database, mockApp, mockManifest);
		await spellDao.createTable();
		await spellDao.createItem(smallSpellFireball);
		await spellDao.createItem(smallSpellAwaken);
		await spellDao.createItem(smallSpellWish);
		const favorites = new FavoritesDao(database);
		favorites.initialize();
		favorites.add("spellbook", smallSpellFireball.url);
		favorites.add("spellbook", smallSpellWish.url);

		const firstPage = await spellDao.readItemsPage(null, { offset: 0, limit: 1 });
		expect(firstPage.items.map((item) => item.url)).toEqual([smallSpellFireball.url]);
		const visibleFavorites = await spellDao.readItemsByUrls(favorites.listUrls("spellbook"), {
			levels: [9], schools: [], sources: [],
		});
		expect(visibleFavorites.map((item) => item.url)).toEqual([smallSpellWish.url]);
		database.close();
	});

	it("returns only leaf DM screen articles from saved favorites", async () => {
		const SQL = await initSqlJs({ wasmBinary });
		const database = new SQL.Database();
		const screenDao = new DmScreenGroupSqlTableDao(database, mockApp, mockManifest);
		await screenDao.createTable();
		const source = { shortName: "PHB", name: "Книга", group: { shortName: "Basic", name: "Основные" } };
		const section: DmScreenItem = { name: { rus: "Раздел", eng: "Section" }, url: "/screen/section", order: 0, source };
		const article: DmScreenItem = { name: { rus: "Статья", eng: "Article" }, url: "/screen/article", order: 1, source, parentUrl: section.url };
		await screenDao.createItem(section);
		await screenDao.createItem(article);

		const leafItems = await screenDao.readLeafItemsByUrls([section.url, article.url]);
		expect(leafItems.map((item) => item.url)).toEqual([article.url]);
		database.close();
	});
});
