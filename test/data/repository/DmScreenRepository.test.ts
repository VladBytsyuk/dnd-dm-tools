import { describe, expect, it, vi } from "vitest";
import { DmScreenRepository } from "../../../src/data/repositories/DmScreenRepository";
import type { DmScreenItem } from "../../../src/domain/models/dm_screen/DmScreenItem";

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
	const dmScreenGroupDao = {
		readChildren: vi.fn().mockResolvedValue([]),
		readAllItems: vi.fn().mockResolvedValue(cachedItem ? [cachedItem] : []),
		readAllItemsNames: vi.fn().mockResolvedValue(cachedItem ? [cachedItem.name.rus] : []),
		readItemByName: vi.fn(async (name: string) =>
			cachedItem && (cachedItem.name.rus === name || cachedItem.name.eng === name) ? cachedItem : null
		),
		readItemByUrl: vi.fn(async (url: string) =>
			cachedItem && cachedItem.url === url ? cachedItem : null
		),
		readChildrenCount: vi.fn().mockResolvedValue(0),
		updateItem: vi.fn(),
		createItem: vi.fn(),
		deleteItemByUrl: vi.fn(),
	};
	const database = {
		dmScreenGroupDao,
		transaction: vi.fn(async (callback: () => Promise<void>) => {
			await callback();
		}),
	};

	return {
		repository: new DmScreenRepository(database as any),
		database,
		dmScreenGroupDao,
	};
}

describe("DmScreenRepository characterization", () => {
	it("returns a cached described item without refreshing", async () => {
		const cachedItem = createDmScreenItem({ description: "<p>Cached</p>" });
		const { repository, database, dmScreenGroupDao } = createDmScreenRepository(cachedItem);
		(repository as any).fetchFromAPI = vi.fn();

		const result = await repository.getFullItemByUrl("/screens/condition");

		expect(result).toEqual(cachedItem);
		expect((repository as any).fetchFromAPI).not.toHaveBeenCalled();
		expect(database.transaction).not.toHaveBeenCalled();
		expect(dmScreenGroupDao.updateItem).not.toHaveBeenCalled();
	});

	it("treats a cached item without description as a partial miss and updates it from remote", async () => {
		const cachedItem = createDmScreenItem({ description: undefined });
		const remoteItem = createDmScreenItem({ description: "<p>Remote description</p>" });
		const { repository, database, dmScreenGroupDao } = createDmScreenRepository(cachedItem);
		(repository as any).fetchFromAPI = vi.fn().mockResolvedValue(remoteItem);

		const result = await repository.getFullItemByUrl("/screens/condition");

		expect((repository as any).fetchFromAPI).toHaveBeenCalledWith("/screens/condition");
		expect(database.transaction).toHaveBeenCalledTimes(1);
		expect(dmScreenGroupDao.updateItem).toHaveBeenCalledWith(remoteItem);
		expect(result).toEqual(remoteItem);
	});

	it("returns null and does not update when a missing-description refresh fails", async () => {
		const cachedItem = createDmScreenItem({ description: undefined });
		const { repository, database, dmScreenGroupDao } = createDmScreenRepository(cachedItem);
		(repository as any).fetchFromAPI = vi.fn().mockResolvedValue(null);

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
		const { repository, dmScreenGroupDao } = createDmScreenRepository(cachedItem);
		(repository as any).fetchFromAPI = vi.fn().mockResolvedValue(remoteItem);

		const result = await repository.getFullItemByName("Очарование");

		expect(dmScreenGroupDao.readItemByName).toHaveBeenCalledWith("Очарование");
		expect((repository as any).fetchFromAPI).toHaveBeenCalledWith("/screens/charmed");
		expect(result).toEqual(remoteItem);
	});
});
