import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterSheetSqlTableDao } from "../../../src/data/database/CharacterSheetSqlTableDao";
import type { CharacterSheetFilters, FullCharacterSheet } from "../../../src/domain/models/character";
import { EmptyFullCharacterSheet, stringifyCharacterData } from "../../../src/domain/models/character";
import { mockDatabase, mockApp, mockManifest } from "../../__mocks__/data";

function createFullCharacterSheet(): FullCharacterSheet {
	const sheet = EmptyFullCharacterSheet();
	sheet.id = 1;
	sheet.url = "hero";
	sheet.name = { rus: "Hero", eng: "Hero" };
	sheet.charClass = "Wizard";
	sheet.level = 5;
	sheet.race = "Elf";
	sheet.playerName = "Player";
	sheet.data.name.value = "Hero";
	sheet.data.info.charClass.value = "Wizard";
	sheet.data.info.level.value = 5;
	sheet.data.info.race.value = "Elf";
	sheet.data.info.playerName.value = "Player";
	sheet.data.info.classes = {
		name: "classes",
		value: [{ className: "Wizard", level: 5 }],
	};
	return sheet;
}

describe("CharacterSheetSqlTableDao", () => {
	let dao: CharacterSheetSqlTableDao;

	beforeEach(() => {
		vi.clearAllMocks();
		dao = new CharacterSheetSqlTableDao(mockDatabase as any, mockApp as any, mockManifest as any);
	});

	it("should build name filter clauses", async () => {
		const where = await dao.filterByName("hero");
		expect(where.whereClauses).toEqual(["(name_rus LIKE ? OR name_eng LIKE ?)"]);
		expect(where.params).toEqual(["%hero%", "%hero%"]);
	});

	it("should build combined character filters", async () => {
		const filters: CharacterSheetFilters = {
			classes: ["Wizard", "Fighter"],
			levels: [3, 5],
			races: ["Elf"],
		};

		const where = await dao.filterByFilters(filters);

		expect(where.whereClauses).toHaveLength(3);
		expect(where.params).toEqual(["Wizard", "Fighter", 3, 5, "Elf"]);
	});

	it("should map sql row into a full character sheet", async () => {
		const sheet = createFullCharacterSheet();
		const row = [
			sheet.id,
			sheet.name.rus,
			sheet.name.eng,
			sheet.charClass,
			sheet.level,
			sheet.race,
			sheet.playerName,
			sheet.url,
			1,
			JSON.stringify(sheet.tags),
			JSON.stringify(sheet.disabledBlocks),
			sheet.edition,
			JSON.stringify(sheet.spells),
			stringifyCharacterData(sheet).data,
			sheet.jsonType,
			sheet.version,
		];

		const mapped = await dao.mapSqlValues(row);

		expect(mapped.url).toBe("hero");
		expect(mapped.name.rus).toBe("Hero");
		expect(mapped.data.info.classes?.value[0].className).toBe("Wizard");
		expect(mapped.data.proficiencies.other.value).toBe("");
	});

	it("should read small items with SQL-side filtering", async () => {
		(mockDatabase.exec as any).mockReturnValueOnce([
			{
				values: [[1, "Hero", "Hero", "Wizard", 5, "Elf", "Player", "hero", 1]],
			},
		]);

		const items = await dao.readAllSmallItems("hero", {
			classes: ["Wizard"],
			levels: [5],
			races: ["Elf"],
		});

		expect(mockDatabase.exec).toHaveBeenCalled();
		expect(items).toEqual([
			{
				name: { rus: "Hero", eng: "Hero" },
				url: "hero",
				charClass: "Wizard",
				level: 5,
				race: "Elf",
				playerName: "Player",
			},
		]);
	});

	it("should persist the first non-empty class when creating and updating", async () => {
		const sheet = createFullCharacterSheet();
		sheet.data.info.classes = {
			name: "classes",
			value: [
				{ className: "", level: 1 },
				{ className: "Wizard", level: 5 },
			],
		};
		vi.spyOn(dao, "checkItemExists").mockResolvedValue(false);

		await dao.createItem(sheet);
		await dao.updateItem(sheet);

		const createParams = (mockDatabase.exec as any).mock.calls[0][1];
		const updateParams = (mockDatabase.exec as any).mock.calls[1][1];

		expect(createParams[2]).toBe("Wizard");
		expect(updateParams[2]).toBe("Wizard");
	});
});
