import { describe, expect, it, vi } from "vitest";
import {
	CharacterSheetStore,
	ClassStore,
	DmScreenStore,
	RaceStore,
} from "src/data/stores";
import { EmptyFullCharacterSheet, type FullCharacterSheet } from "src/domain/models/character";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullRace } from "src/domain/models/race/FullRace";
import { fullClassBard } from "../../__mocks__/domain/models/class/full_class_items";
import {
	smallArchetypeGlamour,
	smallArchetypeLore,
	smallArchetypeValor,
	smallClassBard,
	smallClassWizard,
} from "../../__mocks__/domain/models/class/small_class_items";
import { fullRace1, fullRace1Subrace } from "../../__mocks__/domain/models/race/full_race_items";
import { smallRace1, smallRace2 } from "../../__mocks__/domain/models/race/small_race_items";
import { TransactionalStoreSpy } from "../ports/testDoubles";

const source = {
	shortName: "PHB",
	name: "Книга игрока",
	group: {
		name: "Официальные источники",
		shortName: "Basic",
	},
};

function dmScreenItem(overrides: Partial<DmScreenItem> = {}): DmScreenItem {
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

function characterSheet(overrides: Partial<FullCharacterSheet> = {}): FullCharacterSheet {
	return {
		...EmptyFullCharacterSheet(),
		name: { rus: "Sir Test", eng: "Sir Test" },
		url: "sir-test",
		charClass: "Wizard",
		level: 3,
		race: "Human",
		playerName: "Player",
		...overrides,
	};
}

describe("RaceStore", () => {
	it("saves race trees with nested subraces inside one transaction", async () => {
		const nestedSubrace: FullRace = {
			...fullRace1Subrace,
			name: { rus: "Вложенная подраса", eng: "Nested Subrace" },
			url: "/races/elf/subrace-0/subrace-0",
		};
		const subrace: FullRace = {
			...fullRace1Subrace,
			url: "/races/elf/subrace-0",
			subraces: [nestedSubrace],
		};
		const race: FullRace = {
			...fullRace1,
			subraces: [subrace],
		};
		const fullRaceDao = {
			createItem: vi.fn(),
			createItemWithParent: vi.fn(),
			readItemByUrl: vi.fn(),
			readSubracesByParentUrl: vi.fn(),
		};
		const transactions = new TransactionalStoreSpy();
		const store = new RaceStore({} as any, fullRaceDao as any, transactions);

		await store.saveRaceTree(race);

		expect(fullRaceDao.createItem).toHaveBeenCalledWith(race);
		expect(fullRaceDao.createItemWithParent).toHaveBeenCalledWith(subrace, "/races/elf");
		expect(fullRaceDao.createItemWithParent).toHaveBeenCalledWith(
			nestedSubrace,
			"/races/elf/subrace-0",
		);
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});

	it("reconstructs a small race hierarchy from flat parent links", async () => {
		const child = { ...smallRace2, url: "/races/elf/subrace-0" };
		const smallRaceDao = {
			readAllItemsWithParentUrl: vi.fn().mockResolvedValue([
				{ race: smallRace1, parentUrl: null },
				{ race: child, parentUrl: smallRace1.url },
			]),
			readTopLevelRaces: vi.fn(),
			readSubracesByParentUrl: vi.fn(),
		};
		const store = new RaceStore(smallRaceDao as any, {} as any, new TransactionalStoreSpy());

		const result = await store.readRacesWithSubraces("эльф", null);

		expect(smallRaceDao.readAllItemsWithParentUrl).toHaveBeenCalledWith("эльф", null);
		expect(result).toEqual([{ ...smallRace1, subraces: [{ ...child, subraces: [] }] }]);
	});

	it("reads top-level races, small subraces, and full subraces through DAO-specific queries", async () => {
		const smallRaceDao = {
			readAllItemsWithParentUrl: vi.fn(),
			readTopLevelRaces: vi.fn().mockResolvedValue([smallRace1]),
			readSubracesByParentUrl: vi.fn().mockResolvedValue([smallRace2]),
		};
		const fullRaceDao = {
			createItem: vi.fn(),
			createItemWithParent: vi.fn(),
			readItemByUrl: vi.fn().mockResolvedValue({ ...fullRace1, subraces: undefined }),
			readSubracesByParentUrl: vi.fn().mockResolvedValueOnce([fullRace1Subrace]).mockResolvedValue([]),
		};
		const store = new RaceStore(smallRaceDao as any, fullRaceDao as any, new TransactionalStoreSpy());

		await expect(store.readTopLevelRaces(null, null)).resolves.toEqual([smallRace1]);
		await expect(store.readSubraces("/races/elf")).resolves.toEqual([smallRace2]);
		await expect(store.readFullRaceByUrl("/races/elf")).resolves.toEqual({
			...fullRace1,
			subraces: [{ ...fullRace1Subrace, subraces: [] }],
		});

		expect(smallRaceDao.readTopLevelRaces).toHaveBeenCalledWith(null, null);
		expect(smallRaceDao.readSubracesByParentUrl).toHaveBeenCalledWith("/races/elf");
		expect(fullRaceDao.readSubracesByParentUrl).toHaveBeenCalledWith("/races/elf");
	});
});

describe("ClassStore", () => {
	it("returns only base classes and applies repository-equivalent name filtering", async () => {
		const smallClassDao = {
			readAllItems: vi.fn().mockResolvedValue([
				smallClassBard,
				smallClassWizard,
				smallArchetypeValor,
			]),
			readArchetypesByParentUrl: vi.fn(),
		};
		const store = new ClassStore(smallClassDao as any, {} as any, new TransactionalStoreSpy());

		await expect(store.readBaseClasses("бард", null)).resolves.toEqual([smallClassBard]);

		expect(smallClassDao.readAllItems).toHaveBeenCalledWith(null, null);
	});

	it("reads archetypes for a parent class", async () => {
		const smallClassDao = {
			readAllItems: vi.fn(),
			readArchetypesByParentUrl: vi
				.fn()
				.mockResolvedValue([smallArchetypeValor, smallArchetypeLore, smallArchetypeGlamour]),
		};
		const store = new ClassStore(smallClassDao as any, {} as any, new TransactionalStoreSpy());

		const result = await store.readArchetypesForClass("/classes/bard");

		expect(result.every((item) => item.isArchetype)).toBe(true);
		expect(smallClassDao.readArchetypesByParentUrl).toHaveBeenCalledWith("/classes/bard");
	});

	it("persists full classes in a transaction", async () => {
		const fullClassDao = {
			createItem: vi.fn(),
			readItemByName: vi.fn(),
			readItemByUrl: vi.fn().mockResolvedValue(null),
			updateItem: vi.fn(),
		};
		const transactions = new TransactionalStoreSpy();
		const store = new ClassStore({} as any, fullClassDao as any, transactions);

		await store.saveFullClass(fullClassBard);

		expect(fullClassDao.createItem).toHaveBeenCalledWith(fullClassBard);
		expect(fullClassDao.updateItem).not.toHaveBeenCalled();
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});
});

describe("DmScreenStore", () => {
	it("reads roots, children, counts, names, and cached items through the DM screen DAO", async () => {
		const root = dmScreenItem({ parentUrl: undefined });
		const child = dmScreenItem({ url: "/screens/condition/charmed", parentUrl: root.url });
		const dmScreenDao = {
			readAllItemsNames: vi.fn().mockResolvedValue([root.name.rus]),
			readChildren: vi.fn(async (parentUrl?: string) => (parentUrl ? [child] : [root])),
			readChildrenCount: vi.fn().mockResolvedValue(1),
			readItemByName: vi.fn().mockResolvedValue(root),
			readItemByUrl: vi.fn().mockResolvedValue(child),
			updateItem: vi.fn(),
		};
		const store = new DmScreenStore(dmScreenDao as any, new TransactionalStoreSpy());

		await expect(store.readRootItems()).resolves.toEqual([root]);
		await expect(store.readChildren(root.url)).resolves.toEqual([child]);
		await expect(store.readChildrenCount(root.url)).resolves.toBe(1);
		await expect(store.readAllItemNames()).resolves.toEqual([root.name.rus]);
		await expect(store.readItemByName(root.name.rus)).resolves.toEqual(root);
		await expect(store.readItemByUrl(child.url)).resolves.toEqual(child);
	});

	it("updates a fetched description without altering tree ownership fields", async () => {
		const item = dmScreenItem({
			parentUrl: "/screens/root",
			description: "<p>Remote</p>",
		});
		const dmScreenDao = {
			readAllItemsNames: vi.fn(),
			readChildren: vi.fn(),
			readChildrenCount: vi.fn(),
			readItemByName: vi.fn(),
			readItemByUrl: vi.fn(),
			updateItem: vi.fn(),
		};
		const transactions = new TransactionalStoreSpy();
		const store = new DmScreenStore(dmScreenDao as any, transactions);

		await store.updateItemDescription(item);

		expect(dmScreenDao.updateItem).toHaveBeenCalledWith(item);
		expect(dmScreenDao.updateItem.mock.calls[0][0].parentUrl).toBe("/screens/root");
		expect(transactions.calls.map((call) => call.method)).toEqual(["begin", "commit"]);
	});
});

describe("CharacterSheetStore", () => {
	it("reads optimized small rows and full rows", async () => {
		const sheet = characterSheet();
		const smallSheet = {
			name: sheet.name,
			url: sheet.url,
			charClass: sheet.charClass,
			level: sheet.level,
			race: sheet.race,
			playerName: sheet.playerName,
		};
		const characterSheetDao = {
			createItem: vi.fn(),
			deleteItemByUrl: vi.fn(),
			readAllSmallItems: vi.fn().mockResolvedValue([smallSheet]),
			readFullItemByUrl: vi.fn().mockResolvedValue(sheet),
			readItemByUrl: vi.fn(),
			updateItem: vi.fn(),
		};
		const store = new CharacterSheetStore(characterSheetDao as any, new TransactionalStoreSpy());

		await expect(store.readAllSmallItems()).resolves.toEqual([smallSheet]);
		await expect(store.readFilteredSmallItems("sir", null)).resolves.toEqual([smallSheet]);
		await expect(store.readFullItemByUrl("sir-test")).resolves.toEqual(sheet);

		expect(characterSheetDao.readAllSmallItems).toHaveBeenCalledWith(null, null);
		expect(characterSheetDao.readAllSmallItems).toHaveBeenCalledWith("sir", null);
		expect(characterSheetDao.readFullItemByUrl).toHaveBeenCalledWith("sir-test");
	});

	it("generates unique import URLs from existing sheets", async () => {
		const existingUrls = new Set(["sir-test", "sir-test-2"]);
		const characterSheetDao = {
			createItem: vi.fn(),
			deleteItemByUrl: vi.fn(),
			readAllSmallItems: vi.fn(),
			readFullItemByUrl: vi.fn(),
			readItemByUrl: vi.fn(async (url: string) => (existingUrls.has(url) ? characterSheet() : null)),
			updateItem: vi.fn(),
		};
		const store = new CharacterSheetStore(characterSheetDao as any, new TransactionalStoreSpy());

		await expect(store.generateUniqueUrl("Sir Test!!")).resolves.toBe("sir-test-3");
		await expect(store.isUrlAvailable("new-url")).resolves.toBe(true);
	});

	it("saves imported sheets and deletes sheets in transactions", async () => {
		const sheet = characterSheet();
		const stored = new Map<string, FullCharacterSheet>();
		const characterSheetDao = {
			createItem: vi.fn(async (item: FullCharacterSheet) => {
				stored.set(item.url, item);
			}),
			deleteItemByUrl: vi.fn(async (url: string) => {
				stored.delete(url);
			}),
			readAllSmallItems: vi.fn(),
			readFullItemByUrl: vi.fn(),
			readItemByUrl: vi.fn(async (url: string) => stored.get(url) ?? null),
			updateItem: vi.fn(async (item: FullCharacterSheet) => {
				stored.set(item.url, item);
			}),
		};
		const transactions = new TransactionalStoreSpy();
		const store = new CharacterSheetStore(characterSheetDao as any, transactions);

		await store.saveImportedSheet(sheet);
		await store.deleteByUrl(sheet.url);

		expect(characterSheetDao.createItem).toHaveBeenCalledWith(sheet);
		expect(characterSheetDao.deleteItemByUrl).toHaveBeenCalledWith(sheet.url);
		expect(stored.size).toBe(0);
		expect(transactions.calls.map((call) => call.method)).toEqual([
			"begin",
			"commit",
			"begin",
			"commit",
		]);
	});
});
