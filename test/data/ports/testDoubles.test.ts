import { describe, expect, it } from "vitest";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import {
	FullItemMapperDouble,
	FullItemReadServiceDouble,
	HtmlReadServiceDouble,
	ImportServiceDouble,
	ItemReadStoreDouble,
	ItemWriteStoreDouble,
	SeedMapperDouble,
	SeedReadServiceDouble,
	SmallItemProjectorDouble,
	TransactionalStoreSpy,
	type TestDoubleCallLog,
} from "./testDoubles";

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

describe("data port test doubles", () => {
	it("lets services return success and queued failures", async () => {
		const fullService = new FullItemReadServiceDouble<TestFullItem, { source: string }>()
			.succeed(fullItem)
			.queueResult({ ok: false, reason: "network", error: new Error("offline") });
		const htmlService = new HtmlReadServiceDouble().fail("invalid-response");
		const seedService = new SeedReadServiceDouble<TestSmallItem>().succeed([smallItem]);
		const importService = new ImportServiceDouble<string, TestFullItem>().fail("not-found");

		await expect(fullService.getFullItem("/spells/fireball", { source: "PHB" })).resolves.toMatchObject({
			ok: false,
			reason: "network",
		});
		await expect(fullService.getFullItem("/spells/fireball")).resolves.toEqual({
			ok: true,
			value: fullItem,
		});
		await expect(htmlService.getHtml("/spells/fireball")).resolves.toEqual({
			ok: false,
			reason: "invalid-response",
		});
		await expect(seedService.readSeeds()).resolves.toEqual({
			ok: true,
			value: [smallItem],
		});
		await expect(importService.import("{}")).resolves.toEqual({
			ok: false,
			reason: "not-found",
		});

		expect(fullService.calls.map((call) => call.method)).toEqual(["getFullItem", "getFullItem"]);
		expect(fullService.calls[0].args).toEqual(["/spells/fireball", { source: "PHB" }]);
	});

	it("records mapper, projector, and store call order in a shared log", async () => {
		const calls: TestDoubleCallLog = [];
		const response = { payload: "spell" };
		const mapper = new FullItemMapperDouble<typeof response, TestFullItem>(() => fullItem, calls);
		const projector = new SmallItemProjectorDouble<TestFullItem, TestSmallItem>(
			(item) => ({ name: item.name, url: item.url, source: item.source }),
			calls,
		);
		const seedMapper = new SeedMapperDouble<TestSmallItem, TestSmallItem>((seed) => seed, calls);
		const readStore = new ItemReadStoreDouble<TestSmallItem, TestFullItem, TestFilter>(calls);
		const writeStore = new ItemWriteStoreDouble<TestSmallItem, TestFullItem>(calls);

		readStore.allSmallItems = [smallItem];
		readStore.filteredSmallItems = [smallItem];
		readStore.smallItemNames = [smallItem.name.rus];
		readStore.smallItemsByName.set(smallItem.name.rus, smallItem);
		readStore.fullItemsByName.set(fullItem.name.eng, fullItem);
		readStore.fullItemsByUrl.set(fullItem.url, fullItem);

		const mapped = mapper.map(response, fullItem.url);
		const projected = projector.project(mapped);
		seedMapper.mapSeed(smallItem);
		await readStore.readAllSmallItems();
		await readStore.readFilteredSmallItems("fire", { source: "PHB" });
		await readStore.readAllSmallItemNames();
		await readStore.readSmallItemByName(smallItem.name.rus);
		await readStore.readFullItemByName(fullItem.name.eng);
		await readStore.readFullItemByUrl(fullItem.url);
		await writeStore.saveFetchedFull(mapped);
		await writeStore.upsertUserItem(projected, mapped);
		await writeStore.deleteByUrl(mapped.url);

		expect(calls.map((call) => `${call.target}.${call.method}`)).toEqual([
			"fullItemMapper.map",
			"smallItemProjector.project",
			"seedMapper.mapSeed",
			"itemReadStore.readAllSmallItems",
			"itemReadStore.readFilteredSmallItems",
			"itemReadStore.readAllSmallItemNames",
			"itemReadStore.readSmallItemByName",
			"itemReadStore.readFullItemByName",
			"itemReadStore.readFullItemByUrl",
			"itemWriteStore.saveFetchedFull",
			"itemWriteStore.upsertUserItem",
			"itemWriteStore.deleteByUrl",
		]);
	});

	it("records transaction commit and rollback", async () => {
		const calls: TestDoubleCallLog = [];
		const transactionSpy = new TransactionalStoreSpy(calls);
		const error = new Error("failed write");

		await expect(transactionSpy.transaction(async () => "saved")).resolves.toBe("saved");
		await expect(transactionSpy.transaction(async () => {
			throw error;
		})).rejects.toThrow(error);

		expect(calls.map((call) => call.method)).toEqual(["begin", "commit", "begin", "rollback"]);
		expect(calls[3].args).toEqual([error]);
	});
});
