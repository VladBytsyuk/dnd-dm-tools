import { describe, expect, it, vi } from "vitest";
import type { Dao } from "src/domain/Dao";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type DB from "src/data/database/DB";
import type { TransactionalStore } from "src/data/ports";
import {
	DbTransactionalStore,
	GenericSqlItemReadStore,
	GenericSqlItemWriteStore,
} from "src/data/stores";
import { TransactionalStoreSpy } from "../ports/testDoubles";

interface TestSmallItem extends BaseItem {
	source: string;
}

interface TestFullItem extends TestSmallItem {
	description: string;
}

interface TestFilter {
	source: string;
}

const smallItem: TestSmallItem = {
	name: { rus: "Огненный шар", eng: "Fireball" },
	url: "/spells/fireball",
	source: "PHB",
};

const fullItem: TestFullItem = {
	...smallItem,
	description: "A bright streak flashes.",
};

function createSmallDao(overrides: Partial<Dao<TestSmallItem, TestFilter>> = {}) {
	return {
		readAllItems: vi.fn().mockResolvedValue([smallItem]),
		readItemsPage: vi.fn().mockResolvedValue({ items: [smallItem], hasMore: false }),
		readAllItemsNames: vi.fn().mockResolvedValue([smallItem.name.rus]),
		readItemByName: vi.fn().mockResolvedValue(smallItem),
		readItemByUrl: vi.fn().mockResolvedValue(null),
		createItem: vi.fn().mockResolvedValue(undefined),
		updateItem: vi.fn().mockResolvedValue(undefined),
		deleteItemByUrl: vi.fn().mockResolvedValue(undefined),
		...overrides,
	} as unknown as Dao<TestSmallItem, TestFilter>;
}

function createFullDao(overrides: Partial<Dao<TestFullItem, unknown>> = {}) {
	return {
		readItemByName: vi.fn().mockResolvedValue(fullItem),
		readItemByUrl: vi.fn().mockResolvedValue(fullItem),
		createItem: vi.fn().mockResolvedValue(undefined),
		updateItem: vi.fn().mockResolvedValue(undefined),
		deleteItemByUrl: vi.fn().mockResolvedValue(undefined),
		...overrides,
	} as unknown as Dao<TestFullItem, unknown>;
}

function createReadStore(
	smallDao = createSmallDao(),
	fullDao = createFullDao(),
) {
	return new GenericSqlItemReadStore<TestSmallItem, TestFullItem, TestFilter>(smallDao, fullDao);
}

describe("GenericSqlItemReadStore", () => {
	it("reads all small items through the small DAO", async () => {
		const smallDao = createSmallDao();
		const store = createReadStore(smallDao);

		await expect(store.readAllSmallItems()).resolves.toEqual([smallItem]);

		expect(smallDao.readAllItems).toHaveBeenCalledWith(null, null);
	});

	it("reads filtered small items through the small DAO", async () => {
		const smallDao = createSmallDao();
		const filter = { source: "PHB" };
		const store = createReadStore(smallDao);

		await expect(store.readFilteredSmallItems("fire", filter)).resolves.toEqual([smallItem]);

		expect(smallDao.readAllItems).toHaveBeenCalledWith("fire", filter);
	});

	it("reads a page of small items through the small DAO", async () => {
		const smallDao = createSmallDao();
		const filter = { source: "PHB" };
		const request = { offset: 50, limit: 50 };
		const store = createReadStore(smallDao);

		await expect(store.readSmallItemsPage(filter, request)).resolves.toEqual({
			items: [smallItem],
			hasMore: false,
		});

		expect(smallDao.readItemsPage).toHaveBeenCalledWith(filter, request);
	});

	it("reads small names and small items by name through the small DAO", async () => {
		const smallDao = createSmallDao();
		const store = createReadStore(smallDao);

		await expect(store.readAllSmallItemNames()).resolves.toEqual([smallItem.name.rus]);
		await expect(store.readSmallItemByName(smallItem.name.eng)).resolves.toEqual(smallItem);

		expect(smallDao.readAllItemsNames).toHaveBeenCalledWith();
		expect(smallDao.readItemByName).toHaveBeenCalledWith(smallItem.name.eng);
	});

	it("reads full items by name and URL through the full DAO", async () => {
		const fullDao = createFullDao();
		const store = createReadStore(createSmallDao(), fullDao);

		await expect(store.readFullItemByName(fullItem.name.rus)).resolves.toEqual(fullItem);
		await expect(store.readFullItemByUrl(fullItem.url)).resolves.toEqual(fullItem);

		expect(fullDao.readItemByName).toHaveBeenCalledWith(fullItem.name.rus);
		expect(fullDao.readItemByUrl).toHaveBeenCalledWith(fullItem.url);
	});
});

describe("GenericSqlItemWriteStore", () => {
	it("saves fetched full items without writing small records", async () => {
		const smallDao = createSmallDao();
		const fullDao = createFullDao();
		const transactions = new TransactionalStoreSpy();
		const store = new GenericSqlItemWriteStore(smallDao, fullDao, transactions);

		await store.saveFetchedFull(fullItem);

		expect(fullDao.createItem).toHaveBeenCalledWith(fullItem);
		expect(smallDao.createItem).not.toHaveBeenCalled();
		expect(smallDao.updateItem).not.toHaveBeenCalled();
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});

	it("creates small and full records when upserting a new user item", async () => {
		const smallDao = createSmallDao({ readItemByUrl: vi.fn().mockResolvedValue(null) });
		const fullDao = createFullDao({ readItemByUrl: vi.fn().mockResolvedValue(null) });
		const store = new GenericSqlItemWriteStore(smallDao, fullDao, new TransactionalStoreSpy());

		await store.upsertUserItem(smallItem, fullItem);

		expect(smallDao.createItem).toHaveBeenCalledWith(smallItem);
		expect(smallDao.updateItem).not.toHaveBeenCalled();
		expect(fullDao.createItem).toHaveBeenCalledWith(fullItem);
		expect(fullDao.updateItem).not.toHaveBeenCalled();
	});

	it("updates small and full records when upserting an existing user item", async () => {
		const smallDao = createSmallDao({ readItemByUrl: vi.fn().mockResolvedValue(smallItem) });
		const fullDao = createFullDao({ readItemByUrl: vi.fn().mockResolvedValue(fullItem) });
		const store = new GenericSqlItemWriteStore(smallDao, fullDao, new TransactionalStoreSpy());

		await store.upsertUserItem(smallItem, fullItem);

		expect(smallDao.updateItem).toHaveBeenCalledWith(smallItem);
		expect(smallDao.createItem).not.toHaveBeenCalled();
		expect(fullDao.updateItem).toHaveBeenCalledWith(fullItem);
		expect(fullDao.createItem).not.toHaveBeenCalled();
	});

	it("deletes full and small records inside one transaction", async () => {
		const smallDao = createSmallDao();
		const fullDao = createFullDao();
		const transactions = new TransactionalStoreSpy();
		const store = new GenericSqlItemWriteStore(smallDao, fullDao, transactions);

		await store.deleteByUrl(fullItem.url);

		expect(fullDao.deleteItemByUrl).toHaveBeenCalledWith(fullItem.url);
		expect(smallDao.deleteItemByUrl).toHaveBeenCalledWith(fullItem.url);
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});

	it("rolls back and propagates errors from transactional writes", async () => {
		const error = new Error("write failed");
		const smallDao = createSmallDao({
			createItem: vi.fn().mockRejectedValue(error),
		});
		const transactions = new TransactionalStoreSpy();
		const store = new GenericSqlItemWriteStore(smallDao, createFullDao(), transactions);

		await expect(store.upsertUserItem(smallItem, fullItem)).rejects.toThrow(error);

		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "rollback"]);
		expect(transactions.calls[1].args).toEqual([error]);
	});
});

describe("DbTransactionalStore", () => {
	it("adapts database transactions and returns the callback result", async () => {
		const database = {
			transaction: vi.fn(async (callback: () => Promise<void>) => {
				await callback();
			}),
		};
		const transactions: TransactionalStore = new DbTransactionalStore(database as unknown as Pick<DB, "transaction">);

		await expect(transactions.transaction(async () => "saved")).resolves.toBe("saved");

		expect(database.transaction).toHaveBeenCalledOnce();
	});
});
