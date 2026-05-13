import { describe, expect, it } from "vitest";
import { CharacterSheetImportMapper } from "../../../src/data/mappers/characterSheetImportMapper";
import { stringifyCharacterData } from "../../../src/domain/models/character";
import { EmptyFullCharacterSheet } from "../../../src/domain/models/character/FullCharacterSheet";

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

describe("CharacterSheetImportMapper", () => {
	it("rejects malformed JSON", () => {
		expect(() => new CharacterSheetImportMapper().map("{")).toThrow("Failed to parse JSON:");
	});

	it("rejects invalid jsonType values", () => {
		expect(() =>
			new CharacterSheetImportMapper().map(JSON.stringify({ jsonType: "monster", data: "{}" }))
		).toThrow('Invalid jsonType: expected "character", got "monster"');
	});

	it("rejects imported sheets with a blank character name", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.name.value = " ";

		expect(() =>
			new CharacterSheetImportMapper().map(
				JSON.stringify({
					data: stringifyCharacterData(sheet).data,
					jsonType: "character",
				})
			)
		).toThrow("Failed to import character sheet: Invalid character sheet: character name is required");
	});

	it("maps valid import data without checking persistence", () => {
		const mapped = new CharacterSheetImportMapper().map(createImportJson("Sir Test!!"));

		expect(mapped.name).toEqual({ rus: "Sir Test!!", eng: "Sir Test!!" });
		expect(mapped.url).toBe("sir-test");
		expect(mapped.charClass).toBe("Wizard");
		expect(mapped.level).toBe(3);
		expect(mapped.race).toBe("Human");
		expect(mapped.playerName).toBe("Player");
		expect(mapped.jsonType).toBe("character");
	});

	it("applies defaults for missing optional top-level sections", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.name.value = "Minimal";

		const mapped = new CharacterSheetImportMapper().map(
			JSON.stringify({
				data: stringifyCharacterData(sheet).data,
			})
		);

		expect(mapped.tags).toEqual([]);
		expect(mapped.edition).toBe("2024");
		expect(mapped.spells).toEqual({ mode: "cards", prepared: [], book: [] });
	});
});
