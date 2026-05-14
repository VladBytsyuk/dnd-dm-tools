import { describe, expect, it, vi } from "vitest";
import { SeedStore } from "src/data/stores";
import type { SeedReadService, ServiceResult } from "src/data/ports";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import { TransactionalStoreSpy } from "../ports/testDoubles";

interface TestSeed {
	name: string;
	url: string;
}

interface TestItem extends BaseItem {
	source: string;
}

const seed: TestSeed = { name: "Fireball", url: "/spells/fireball" };
const item: TestItem = {
	name: { rus: "Огненный шар", eng: "Fireball" },
	url: seed.url,
	source: "PHB",
};

function seedService(result: ServiceResult<TestSeed[]>): SeedReadService<TestSeed> {
	return {
		readSeeds: vi.fn().mockResolvedValue(result),
	};
}

function createDao(overrides: Record<string, unknown> = {}) {
	return {
		getTableName: vi.fn().mockReturnValue("small_spellbook"),
		isTableExists: vi.fn().mockResolvedValue(true),
		isTableEmpty: vi.fn().mockResolvedValue(true),
		createItem: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe("SeedStore", () => {
	it("writes seed data into an empty table through the DAO", async () => {
		const dao = createDao();
		const service = seedService({ ok: true, value: [seed] });
		const transactions = new TransactionalStoreSpy();
		const store = new SeedStore(transactions);

		await store.seedTable(dao as any, service, {
			mapSeeds: (seeds) => seeds.map((it) => ({ ...item, url: it.url })),
		});

		expect(service.readSeeds).toHaveBeenCalledOnce();
		expect(dao.createItem).toHaveBeenCalledWith(item);
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});

	it("does not duplicate data when the table is already populated", async () => {
		const dao = createDao({ isTableEmpty: vi.fn().mockResolvedValue(false) });
		const service = seedService({ ok: true, value: [seed] });
		const store = new SeedStore(new TransactionalStoreSpy());

		await store.seedTable(dao as any, service, {
			mapSeeds: (seeds) => seeds.map(() => item),
		});

		expect(service.readSeeds).not.toHaveBeenCalled();
		expect(dao.createItem).not.toHaveBeenCalled();
	});

	it("rolls back the failed table seed without running later writes in that table", async () => {
		const error = new Error("insert failed");
		const firstItem = { ...item, url: "/spells/one" };
		const secondItem = { ...item, url: "/spells/two" };
		const dao = createDao({
			createItem: vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(error),
		});
		const transactions = new TransactionalStoreSpy();
		const store = new SeedStore(transactions);

		await expect(
			store.seedTable(
				dao as any,
				seedService({ ok: true, value: [seed, { ...seed, url: secondItem.url }] }),
				{ mapSeeds: () => [firstItem, secondItem] },
			),
		).rejects.toThrow(error);

		expect(dao.createItem).toHaveBeenCalledTimes(2);
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "rollback"]);
		expect(transactions.calls[1].args).toEqual([error]);
	});

	it("writes race parent links through the race DAO", async () => {
		const race = {
			...item,
			abilities: [],
			type: { name: "Базовые", order: 0 },
			source: {
				shortName: "PHB",
				name: "Книга игрока",
				group: { name: "Официальные источники", shortName: "Basic" },
			},
		} as SmallRace;
		const dao = {
			getTableName: vi.fn().mockReturnValue("small_races"),
			isTableExists: vi.fn().mockResolvedValue(true),
			isTableEmpty: vi.fn().mockResolvedValue(true),
			createItemWithParent: vi.fn().mockResolvedValue(undefined),
		};
		const service: SeedReadService<SmallRace> = {
			readSeeds: vi.fn().mockResolvedValue({ ok: true, value: [race] }),
		};
		const store = new SeedStore(new TransactionalStoreSpy());

		await store.seedRaceTable(dao, service, {
			mapSeeds: (seeds) => seeds.map((raceSeed) => ({ item: raceSeed, parentUrl: "/races/elf" })),
		});

		expect(dao.createItemWithParent).toHaveBeenCalledWith(race, "/races/elf");
	});
});
