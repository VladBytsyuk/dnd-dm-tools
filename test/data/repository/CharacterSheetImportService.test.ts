import { describe, expect, it, vi } from "vitest";
import { CharacterSheetImportService } from "../../../src/data/repositories/CharacterSheetImportService";
import { EmptyFullCharacterSheet } from "../../../src/domain/models/character/FullCharacterSheet";
import { stringifyCharacterData } from "../../../src/domain/models/character";

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

describe("CharacterSheetImportService", () => {
	it("should assign unique urls for imports with colliding normalized names", async () => {
		const storedUrls = new Set<string>(["sir-test"]);
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn(async (url: string) => (storedUrls.has(url) ? { url } : null)),
		});

		const imported = await service.importFromJson(createImportJson("Sir-Test!!"));

		expect(imported.url).toBe("sir-test-2");
	});

	it("should apply defaults for missing optional top-level sections", async () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.name.value = "Minimal";
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn().mockResolvedValue(null),
		});

		const imported = await service.importFromJson(
			JSON.stringify({
				data: stringifyCharacterData(sheet).data,
			})
		);

		expect(imported.jsonType).toBe("character");
		expect(imported.tags).toEqual([]);
		expect(imported.edition).toBe("2024");
		expect(imported.spells).toEqual({ mode: "cards", prepared: [], book: [] });
	});

	it("should reject invalid jsonType values", async () => {
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn().mockResolvedValue(null),
		});

		await expect(
			service.importFromJson(JSON.stringify({ jsonType: "monster", data: "{}" }))
		).rejects.toThrow('Invalid jsonType: expected "character", got "monster"');
	});

	it("should reject non-empty-string input validation failures", async () => {
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn().mockResolvedValue(null),
		});

		await expect(service.importFromJson("")).rejects.toThrow(
			"Invalid input: expected non-empty string"
		);
	});

	it("should reject malformed JSON with the parse error in the message", async () => {
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn().mockResolvedValue(null),
		});

		await expect(service.importFromJson("{")).rejects.toThrow("Failed to parse JSON:");
	});

	it("should reject imported sheets with a blank character name", async () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.name.value = " ";
		const service = new CharacterSheetImportService({
			readItemByUrl: vi.fn().mockResolvedValue(null),
		});

		await expect(
			service.importFromJson(
				JSON.stringify({
					data: stringifyCharacterData(sheet).data,
					jsonType: "character",
				})
			)
		).rejects.toThrow("Failed to import character sheet: Invalid character sheet: character name is required");
	});
});
