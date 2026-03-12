import { describe, expect, it, vi } from "vitest";
import { CharacterSheetRepository } from "../../../src/data/repositories/CharacterSheetRepository";
import { EmptyFullCharacterSheet } from "../../../src/domain/models/character/FullCharacterSheet";
import { stringifyCharacterData, type FullCharacterSheet } from "../../../src/domain/models/character";

function createImportJson(name: string): string {
	const sheet = EmptyFullCharacterSheet();
	sheet.data.name.value = name;
	sheet.data.info.charClass.value = "Wizard";
	sheet.data.info.level.value = 3;
	sheet.data.info.race.value = "Human";
	sheet.data.info.playerName.value = "Player";

	return JSON.stringify({
		tags: [],
		disabledBlocks: sheet.disabledBlocks,
		edition: sheet.edition,
		spells: sheet.spells,
		data: stringifyCharacterData(sheet).data,
		jsonType: "character",
		version: sheet.version,
	});
}

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
	it("should keep imported character sheets distinct when names normalize to the same slug", async () => {
		const { repository, storedItems } = createCharacterSheetRepository();

		const first = await repository.importFromJson(createImportJson("Sir Test"));
		const second = await repository.importFromJson(createImportJson("Sir-Test!!"));

		expect(first.url).toBe("sir-test");
		expect(second.url).toBe("sir-test-2");
		expect(storedItems).toHaveLength(2);
		expect(storedItems.map((item) => item.url)).toEqual(["sir-test", "sir-test-2"]);
	});
});
