import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpellbookRepository } from "../../../src/data/repositories/SpellbookRepository";
import type { FullSpell } from "../../../src/domain/models/spell/FullSpell";
import type { SmallSpell } from "../../../src/domain/models/spell/SmallSpell";
import { fullSpellAwaken, fullSpellFireball } from "../../__mocks__/domain/models/spell/full_spell_items";
import { smallSpellAwaken, smallSpellFireball } from "../../__mocks__/domain/models/spell/small_spell_items";

function toSmallSpell(fullSpell: FullSpell): SmallSpell {
	return {
		name: fullSpell.name,
		level: fullSpell.level,
		school: fullSpell.school,
		components: fullSpell.components,
		url: fullSpell.url,
		source: fullSpell.source,
	};
}

function savedSmallSpellFromFull(fullSpell: FullSpell): SmallSpell {
	return {
		...fullSpell,
		type: "",
	} as SmallSpell;
}

function createStatefulSpellRepository(
	initialSmallItems: SmallSpell[] = [],
	initialFullItems: FullSpell[] = []
) {
	const smallItems = [...initialSmallItems];
	const fullItems = [...initialFullItems];

	const smallSpellDao = {
		readAllItems: vi.fn(async () => [...smallItems]),
		readAllItemsNames: vi.fn(async () => smallItems.map((item) => item.name.rus)),
		readItemByName: vi.fn(async (name: string) =>
			smallItems.find((item) => item.name.rus === name || item.name.eng === name) ?? null
		),
		readItemByUrl: vi.fn(async (url: string) => smallItems.find((item) => item.url === url) ?? null),
		createItem: vi.fn(async (item: SmallSpell) => {
			smallItems.push(item);
		}),
		updateItem: vi.fn(async (item: SmallSpell) => {
			const index = smallItems.findIndex((stored) => stored.url === item.url);
			if (index >= 0) smallItems[index] = item;
		}),
		deleteItemByUrl: vi.fn(async (url: string) => {
			const index = smallItems.findIndex((item) => item.url === url);
			if (index >= 0) smallItems.splice(index, 1);
		}),
	};

	const fullSpellDao = {
		readItemByName: vi.fn(async (name: string) =>
			fullItems.find((item) => item.name.rus === name || item.name.eng === name) ?? null
		),
		readItemByUrl: vi.fn(async (url: string) => fullItems.find((item) => item.url === url) ?? null),
		createItem: vi.fn(async (item: FullSpell) => {
			fullItems.push(item);
		}),
		updateItem: vi.fn(async (item: FullSpell) => {
			const index = fullItems.findIndex((stored) => stored.url === item.url);
			if (index >= 0) fullItems[index] = item;
		}),
		deleteItemByUrl: vi.fn(async (url: string) => {
			const index = fullItems.findIndex((item) => item.url === url);
			if (index >= 0) fullItems.splice(index, 1);
		}),
	};

	const database = {
		smallSpellDao,
		fullSpellDao,
		transaction: vi.fn(async (callback: () => Promise<void>) => {
			await callback();
		}),
	};

	return {
		repository: new SpellbookRepository(database as any),
		database,
		smallSpellDao,
		fullSpellDao,
		smallItems,
		fullItems,
	};
}

describe("BaseRepository characterization", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns a cached full item without fetching remotely", async () => {
		const { repository, fullSpellDao } = createStatefulSpellRepository(
			[smallSpellFireball],
			[fullSpellFireball]
		);
		const fetchFromAPI = vi.fn();
		(repository as any).fetchFromAPI = fetchFromAPI;

		const result = await repository.getFullItemByUrl("/spells/fireball");

		expect(result).toEqual(fullSpellFireball);
		expect(fullSpellDao.readItemByUrl).toHaveBeenCalledWith("/spells/fireball");
		expect(fetchFromAPI).not.toHaveBeenCalled();
	});

	it("persists and returns a remotely fetched full item on cache miss", async () => {
		const remoteSpell = { ...fullSpellAwaken, url: "" };
		const { repository, database, fullSpellDao, fullItems } = createStatefulSpellRepository(
			[smallSpellAwaken],
			[]
		);
		(repository as any).fetchFromAPI = vi.fn().mockResolvedValue(remoteSpell);

		const result = await repository.getFullItemByUrl("/spells/awaken");

		expect((repository as any).fetchFromAPI).toHaveBeenCalledWith("/spells/awaken");
		expect(database.transaction).toHaveBeenCalledTimes(1);
		expect(fullSpellDao.createItem).toHaveBeenCalledWith({
			...remoteSpell,
			url: "/spells/awaken",
		});
		expect(result).toEqual({
			...remoteSpell,
			url: "/spells/awaken",
		});
		expect(fullItems).toEqual([
			{
				...remoteSpell,
				url: "/spells/awaken",
			},
		]);
	});

	it("returns null and does not persist when remote fetch fails", async () => {
		const { repository, database, fullSpellDao, fullItems } = createStatefulSpellRepository(
			[smallSpellAwaken],
			[]
		);
		(repository as any).fetchFromAPI = vi.fn().mockResolvedValue(null);

		const result = await repository.getFullItemByUrl("/spells/awaken");

		expect(result).toBeNull();
		expect(database.transaction).not.toHaveBeenCalled();
		expect(fullSpellDao.createItem).not.toHaveBeenCalled();
		expect(fullItems).toEqual([]);
	});

	it("creates both small and full records when saving a new item", async () => {
		const { repository, database, smallSpellDao, fullSpellDao, smallItems, fullItems } =
			createStatefulSpellRepository();

		const result = await repository.putItem(fullSpellFireball);

		expect(result).toBe(true);
		expect(database.transaction).toHaveBeenCalledTimes(1);
		expect(smallSpellDao.createItem).toHaveBeenCalledWith(savedSmallSpellFromFull(fullSpellFireball));
		expect(fullSpellDao.createItem).toHaveBeenCalledWith(fullSpellFireball);
		expect(smallItems).toEqual([savedSmallSpellFromFull(fullSpellFireball)]);
		expect(fullItems).toEqual([fullSpellFireball]);
	});

	it("updates both small and full records when saving an existing item", async () => {
		const updatedFullSpell = {
			...fullSpellFireball,
			description: "Updated description",
		};
		const { repository, smallSpellDao, fullSpellDao, fullItems } = createStatefulSpellRepository(
			[toSmallSpell(fullSpellFireball)],
			[fullSpellFireball]
		);

		const result = await repository.putItem(updatedFullSpell);

		expect(result).toBe(true);
		expect(smallSpellDao.updateItem).toHaveBeenCalledWith(savedSmallSpellFromFull(updatedFullSpell));
		expect(fullSpellDao.updateItem).toHaveBeenCalledWith(updatedFullSpell);
		expect(fullItems).toEqual([updatedFullSpell]);
	});

	it("deletes both records and reloads invalidated small/filter caches", async () => {
		const { repository, smallSpellDao, fullSpellDao, smallItems, fullItems } =
			createStatefulSpellRepository(
				[toSmallSpell(fullSpellFireball), toSmallSpell(fullSpellAwaken)],
				[fullSpellFireball, fullSpellAwaken]
			);

		await repository.initialize();
		expect(await repository.getAllSmallItems()).toHaveLength(2);

		const result = await repository.deleteItem("/spells/fireball");

		expect(result).toBe(true);
		expect(fullSpellDao.deleteItemByUrl).toHaveBeenCalledWith("/spells/fireball");
		expect(smallSpellDao.deleteItemByUrl).toHaveBeenCalledWith("/spells/fireball");
		expect(smallItems).toEqual([toSmallSpell(fullSpellAwaken)]);
		expect(fullItems).toEqual([fullSpellAwaken]);
		expect(await repository.getAllSmallItems()).toEqual([toSmallSpell(fullSpellAwaken)]);
		expect(await repository.getAllFilters()).toEqual({
			levels: [5],
			schools: ["преобразование"],
			sources: ["PHB"],
		});
	});

	it("returns false when a transactional save fails", async () => {
		const { repository, database, smallSpellDao, fullSpellDao } = createStatefulSpellRepository();
		database.transaction.mockRejectedValueOnce(new Error("transaction failed"));

		const result = await repository.putItem(fullSpellFireball);

		expect(result).toBe(false);
		expect(smallSpellDao.createItem).not.toHaveBeenCalled();
		expect(fullSpellDao.createItem).not.toHaveBeenCalled();
	});

	it("returns false when a transactional delete fails", async () => {
		const { repository, database, smallSpellDao, fullSpellDao } = createStatefulSpellRepository(
			[toSmallSpell(fullSpellFireball)],
			[fullSpellFireball]
		);
		database.transaction.mockRejectedValueOnce(new Error("transaction failed"));

		const result = await repository.deleteItem("/spells/fireball");

		expect(result).toBe(false);
		expect(smallSpellDao.deleteItemByUrl).not.toHaveBeenCalled();
		expect(fullSpellDao.deleteItemByUrl).not.toHaveBeenCalled();
	});
});
