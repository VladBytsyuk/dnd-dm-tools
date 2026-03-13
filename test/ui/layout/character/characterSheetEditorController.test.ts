import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmptyFullCharacterSheet } from "../../../../src/domain/models/character/FullCharacterSheet";
import { createEmptyCharacterSpellbook } from "../../../../src/domain/models/character/CharacterSpellbook";
import {
	CharacterSheetEditorController,
	extractLegacyProfText,
	migrateEquipmentList,
	migrateLegacyProficiencies,
	migrateToMulticlass,
} from "../../../../src/ui/layout/character/characterSheetEditorController";

describe("CharacterSheetEditorController", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should keep pending save bound to the sheet that was edited", async () => {
		const putItem = vi.fn().mockResolvedValue(true);
		const controller = new CharacterSheetEditorController({
			repository: { putItem },
			debounceMs: 1000,
		});
		const first = EmptyFullCharacterSheet();
		first.url = "first";
		const second = EmptyFullCharacterSheet();
		second.url = "second";

		controller.open(first);
		controller.updateName("First Updated");
		controller.open(second);

		await vi.advanceTimersByTimeAsync(1000);

		expect(putItem).toHaveBeenCalledTimes(1);
		expect(putItem.mock.calls[0][0].url).toBe("first");
		expect(putItem.mock.calls[0][0].data.name.value).toBe("First Updated");
		expect(second.data.name.value).toBe("");
	});

	it("should run legacy migrations and schedule a save once", async () => {
		const putItem = vi.fn().mockResolvedValue(true);
		const controller = new CharacterSheetEditorController({
			repository: { putItem },
			debounceMs: 1000,
			uuidFn: () => "generated-id",
		});
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "legacy";
		sheet.data.info.classes = { name: "classes", value: [] };
		sheet.data.info.charClass.value = "Fighter";
		sheet.data.attunementsList = [{ id: "legacy-1", checked: true, value: "Ring" }];
		sheet.data.equipmentList = undefined;
		sheet.data.text.prof.value.data.content = [
			{ type: "paragraph", content: [{ type: "text", text: "Simple weapons" }] },
		];

		controller.open(sheet);
		expect(controller.applyLegacyMigrations()).toBe(true);

		expect(controller.getState().draft?.data.info.classes.value[0].className).toBe("Fighter");
		expect(controller.getState().draft?.data.equipmentList?.[0].id).toBe("generated-id");
		expect(controller.getState().draft?.data.proficiencies.other.value).toBe("Simple weapons");

		await vi.advanceTimersByTimeAsync(1000);
		expect(putItem.mock.calls[0][0].url).toBe("legacy");
	});

	it("should synchronize spellbook derived values into spell info", () => {
		const controller = new CharacterSheetEditorController();
		const sheet = EmptyFullCharacterSheet();
		sheet.data.proficiency = 3;
		sheet.data.stats.wis.score = 18;
		sheet.data.stats.wis.modifier = 4;
		controller.open(sheet);

		const spellbook = createEmptyCharacterSpellbook();
		spellbook.baseAbilityCode = "wis";
		spellbook.saveDcOverride = null;
		spellbook.attackBonusOverride = null;

		controller.updateSpellbook(spellbook);

		expect(controller.getState().draft?.data.spellsInfo.base.code).toBe("wis");
		expect(controller.getState().draft?.data.spellsInfo.save.value).toBe("15");
		expect(controller.getState().draft?.data.spellsInfo.mod.value).toBe("7");
	});

	it("should expose save errors in session state", async () => {
		const controller = new CharacterSheetEditorController({
			repository: { putItem: vi.fn().mockResolvedValue(false) },
			debounceMs: 1000,
		});
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "save-error";

		controller.open(sheet);
		controller.updateName("Broken");

		await vi.advanceTimersByTimeAsync(1000);

		expect(controller.getState().status).toBe("error");
		expect(controller.getState().errorMessage).toContain("Не удалось сохранить");
	});

	it("should fall back when structuredClone throws at runtime", () => {
		const originalStructuredClone = globalThis.structuredClone;
		vi.stubGlobal("structuredClone", () => {
			throw new DOMException("cannot clone", "DataCloneError");
		});

		const controller = new CharacterSheetEditorController();
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "clone-fallback";

		expect(() => controller.open(sheet)).not.toThrow();
		expect(controller.getState().draft?.url).toBe("clone-fallback");

		vi.stubGlobal("structuredClone", originalStructuredClone);
	});
});

describe("characterSheetEditorController helpers", () => {
	it("should migrate legacy class data into multiclass array", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.info.classes = { name: "classes", value: [] };
		sheet.data.info.charClass.value = "Rogue";
		sheet.data.info.charSubclass.value = "Thief";
		sheet.data.info.level.value = 4;

		expect(migrateToMulticlass(sheet.data)).toBe(true);
		expect(sheet.data.info.classes.value).toEqual([
			{ className: "Rogue", subclassName: "Thief", level: 4 },
		]);
	});

	it("should migrate attunements into equipment list", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.equipmentList = undefined;
		sheet.data.attunementsList = [{ id: "old", checked: true, value: "Amulet" }];

		expect(migrateEquipmentList(sheet.data, () => "eq-1")).toBe(true);
		expect(sheet.data.equipmentList?.[0]).toMatchObject({
			id: "eq-1",
			isAttuned: true,
			isMagic: true,
			name: { value: "Amulet" },
		});
	});

	it("should extract and migrate legacy proficiencies text", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.text.prof.value.data.content = [
			{ type: "paragraph", content: [{ type: "text", text: "Armor" }] },
			{ type: "paragraph", content: [{ type: "text", text: "Weapons" }] },
		];

		expect(extractLegacyProfText(sheet.data.text.prof)).toBe("Armor\nWeapons");
		expect(migrateLegacyProficiencies(sheet.data)).toBe(true);
		expect(sheet.data.proficiencies.other.value).toBe("Armor\nWeapons");
	});
});
