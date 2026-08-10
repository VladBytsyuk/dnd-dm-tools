import { describe, expect, it, vi } from "vitest";
import { CharacterSheetRepository } from "../../../src/data/repositories/CharacterSheetRepository";
import { EmptyFullCharacterSheet } from "../../../src/domain/models/character/FullCharacterSheet";
import type { FullCharacterSheet } from "../../../src/domain/models/character";

function createCharacterSheetRepository() {
	const storedItems: FullCharacterSheet[] = [];

	const characterSheetDao = {
		readItemByUrl: vi.fn(async (url: string) => storedItems.find((item) => item.url === url) ?? null),
		readFullItemByUrl: vi.fn(async (url: string) => storedItems.find((item) => item.url === url) ?? null),
		readAllSmallItems: vi.fn(async () =>
			storedItems.map((item) => ({
				name: item.name,
				url: item.url,
				charClass: item.charClass,
				level: item.level,
				race: item.race,
				playerName: item.playerName,
			}))
		),
		createItem: vi.fn(async (item: FullCharacterSheet) => {
			storedItems.push(item);
		}),
		updateItem: vi.fn(async (item: FullCharacterSheet) => {
			const index = storedItems.findIndex((stored) => stored.url === item.url);
			if (index >= 0) {
				storedItems[index] = item;
			}
		}),
	};

	const database = {
		characterSheetDao,
		transaction: vi.fn(async (callback: () => Promise<void>) => {
			await callback();
		}),
	} as any;

	return {
		repository: new CharacterSheetRepository(database),
		storedItems,
		characterSheetDao,
	};
}

describe("CharacterSheetRepository", () => {
	it("should save a new character sheet through the character sheet DAO only", async () => {
		const { repository, characterSheetDao, storedItems } = createCharacterSheetRepository();
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "new-sheet";
		sheet.name = { rus: "New Sheet", eng: "New Sheet" };

		const result = await repository.putItem(sheet);

		expect(result).toBe(true);
		expect(characterSheetDao.createItem).toHaveBeenCalledWith(sheet);
		expect(characterSheetDao.updateItem).not.toHaveBeenCalled();
		expect(storedItems).toHaveLength(1);
	});

	it("should update an existing character sheet through the character sheet DAO only", async () => {
		const { repository, characterSheetDao, storedItems } = createCharacterSheetRepository();
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "existing-sheet";
		sheet.name = { rus: "Existing", eng: "Existing" };
		storedItems.push(sheet);

		sheet.name.rus = "Existing Updated";
		const result = await repository.putItem(sheet);

		expect(result).toBe(true);
		expect(characterSheetDao.updateItem).toHaveBeenCalledWith(sheet);
		expect(characterSheetDao.createItem).not.toHaveBeenCalled();
	});

	it("should delete through the character sheet DAO only", async () => {
		const { repository, characterSheetDao, storedItems } = createCharacterSheetRepository();
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "delete-sheet";
		storedItems.push(sheet);
		characterSheetDao.deleteItemByUrl = vi.fn(async (url: string) => {
			const index = storedItems.findIndex((item) => item.url === url);
			if (index >= 0) storedItems.splice(index, 1);
		});

		const result = await repository.deleteItem("delete-sheet");

		expect(result).toBe(true);
		expect(characterSheetDao.deleteItemByUrl).toHaveBeenCalledWith("delete-sheet");
		expect(storedItems).toHaveLength(0);
	});

	it("should delegate name filtering to the DAO", async () => {
		const { repository, characterSheetDao } = createCharacterSheetRepository();
		const smallItems = [
			{
				name: { rus: "Hero", eng: "Hero" },
				url: "hero",
				charClass: "Wizard",
				level: 5,
				race: "Elf",
				playerName: "Player",
			},
		];
		characterSheetDao.readAllSmallItems.mockResolvedValueOnce(smallItems);

		const result = await repository.getFilteredSmallItems("hero", {
			classes: ["Wizard"],
			levels: [5],
			races: ["Elf"],
		});

		expect(characterSheetDao.readAllSmallItems).toHaveBeenCalledWith("hero", {
			classes: ["Wizard"],
			levels: [5],
			races: ["Elf"],
		});
		expect(result).toEqual(smallItems);
	});
});
