import { describe, expect, it, vi } from "vitest";
import { DmScreenRepository } from "../../../src/data/repositories/DmScreenRepository";
import type { DmScreenItem } from "../../../src/domain/models/dm_screen/DmScreenItem";
import { FullItemReadServiceDouble } from "../ports/testDoubles";

const source = {
	shortName: "PHB",
	name: "Книга игрока",
	group: {
		name: "Официальные источники",
		shortName: "Basic",
	},
};

function createDmScreenItem(overrides: Partial<DmScreenItem> = {}): DmScreenItem {
	return {
		name: { rus: "Состояние", eng: "Condition" },
		url: "/screens/condition",
		order: 1,
		source,
		group: "Правила",
		icon: "condition",
		...overrides,
	};
}

function createDmScreenRepository(cachedItem: DmScreenItem | null) {
	let storedItem = cachedItem;
	const dmScreenGroupDao = {
		readChildren: vi.fn().mockResolvedValue([]),
		readAllItems: vi.fn(async () => storedItem ? [storedItem] : []),
		readAllItemsNames: vi.fn(async () => storedItem ? [storedItem.name.rus] : []),
		readItemByName: vi.fn(async (name: string) =>
			storedItem && (storedItem.name.rus === name || storedItem.name.eng === name) ? storedItem : null
		),
		readItemByUrl: vi.fn(async (url: string) =>
			storedItem && storedItem.url.toLocaleLowerCase() === url.toLocaleLowerCase()
				? storedItem
				: null
		),
		readChildrenCount: vi.fn().mockResolvedValue(0),
		updateItem: vi.fn(async (item: DmScreenItem) => {
			storedItem = item;
		}),
		createItem: vi.fn(),
		deleteItemByUrl: vi.fn(),
	};
	const database = {
		dmScreenGroupDao,
		transaction: vi.fn(async (callback: () => Promise<void>) => {
			await callback();
		}),
	};

	const service = new FullItemReadServiceDouble<any>();

	return {
		repository: new DmScreenRepository(database as any, service),
		database,
		dmScreenGroupDao,
		service,
	};
}

describe("DmScreenRepository characterization", () => {
	it("returns a cached described item without refreshing", async () => {
		const cachedItem = createDmScreenItem({ description: "<p>Cached</p>" });
		const { repository, database, dmScreenGroupDao, service } = createDmScreenRepository(cachedItem);

		const result = await repository.getFullItemByUrl("/screens/condition");

		expect(result).toEqual(cachedItem);
		expect(service.calls).toEqual([]);
		expect(database.transaction).not.toHaveBeenCalled();
		expect(dmScreenGroupDao.updateItem).not.toHaveBeenCalled();
	});

	it("treats a cached item without description as a partial miss and updates it from remote", async () => {
		const cachedItem = createDmScreenItem({ description: undefined });
		const remoteItem = createDmScreenItem({ description: "<p>Remote description</p>" });
		const { repository, database, dmScreenGroupDao, service } = createDmScreenRepository(cachedItem);
		service.succeed(remoteItem as any);

		const result = await repository.getFullItemByUrl("/screens/condition");

		expect(service.calls[0]).toMatchObject({
			method: "getFullItem",
			args: ["/screens/condition", undefined],
		});
		expect(database.transaction).toHaveBeenCalledTimes(1);
		expect(dmScreenGroupDao.updateItem).toHaveBeenCalledWith(remoteItem);
		expect(result).toEqual(remoteItem);
	});

	it("updates the canonical cached URL when the requested URL casing differs", async () => {
		const cachedItem = createDmScreenItem({
			name: { rus: "Досягаемость", eng: "Reach" },
			url: "/screens/reach",
			description: undefined,
		});
		const remoteItem = {
			...cachedItem,
			url: "/screens/Reach",
			description: "<p>Remote description</p>",
		};
		const { repository, dmScreenGroupDao, service } = createDmScreenRepository(cachedItem);
		service.succeed(remoteItem as any);

		const firstResult = await repository.getFullItemByUrl("/screens/Reach");
		const secondResult = await repository.getFullItemByUrl("/screens/Reach");

		expect(service.calls).toHaveLength(1);
		expect(dmScreenGroupDao.updateItem).toHaveBeenCalledWith({
			...remoteItem,
			url: "/screens/reach",
		});
		expect(firstResult?.url).toBe("/screens/reach");
		expect(secondResult?.description).toBe("<p>Remote description</p>");
	});

	it("returns null and does not update when a missing-description refresh fails", async () => {
		const cachedItem = createDmScreenItem({ description: undefined });
		const { repository, database, dmScreenGroupDao, service } = createDmScreenRepository(cachedItem);
		service.fail("network");

		const result = await repository.getFullItemByUrl("/screens/condition");

		expect(result).toBeNull();
		expect(database.transaction).not.toHaveBeenCalled();
		expect(dmScreenGroupDao.updateItem).not.toHaveBeenCalled();
	});

	it("refreshes by URL when name lookup finds an item without description", async () => {
		const cachedItem = createDmScreenItem({
			name: { rus: "Очарование", eng: "Charmed" },
			url: "/screens/charmed",
			description: undefined,
		});
		const remoteItem = { ...cachedItem, description: "<p>Remote</p>" };
		const { repository, dmScreenGroupDao, service } = createDmScreenRepository(cachedItem);
		service.succeed(remoteItem as any);

		const result = await repository.getFullItemByName("Очарование");

		expect(dmScreenGroupDao.readItemByName).toHaveBeenCalledWith("Очарование");
		expect(service.calls[0]).toMatchObject({
			method: "getFullItem",
			args: ["/screens/charmed", undefined],
		});
		expect(result).toEqual(remoteItem);
	});

	it("filters across all DM screen items, not only root items", async () => {
		const childItem = createDmScreenItem({
			name: { rus: "Очарование", eng: "Charmed" },
			url: "/screens/charmed",
		});
		const { repository, dmScreenGroupDao } = createDmScreenRepository(childItem);

		const result = await repository.getFilteredItems("charm");

		expect(dmScreenGroupDao.readAllItems).toHaveBeenCalledWith(null, null);
		expect(result).toEqual([childItem]);
	});
});
