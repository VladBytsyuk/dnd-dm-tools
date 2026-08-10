import { describe, expect, it } from "vitest";
import { mapCharacterSheetToEncounterParticipant } from "src/domain/mappers";
import { EmptyFullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";

describe("mapCharacterSheetToEncounterParticipant", () => {
	it("maps valid character combat fields to an encounter participant", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "/character-sheets/658ded7cf2bd044142897fb6";
		sheet.name.rus = "Алиса";
		sheet.data.vitality["hp-max"].value = 30;
		sheet.data.vitality["hp-current"].value = 24;
		sheet.data.vitality["hp-temp"].value = 5;
		sheet.data.vitality.ac.value = 17;
		sheet.data.vitality.initiative.value = 3;
		sheet.data.vitality["passive-perception"].value = 14;
		sheet.data.spells.levels["1"].slotCountOverride = 4;
		sheet.data.spells.levels["1"].slotsUsed = [true, false, false, false];

		const participant = mapCharacterSheetToEncounterParticipant(sheet);

		expect(participant).toMatchObject({
			url: "/character-sheets/658ded7cf2bd044142897fb6",
			name: "Алиса",
			hpCurrent: 24,
			hpTemporary: 5,
			hpMax: 30,
			armorClass: 17,
			initiativeModifier: 3,
			passivePerception: 14,
			side: "pc",
			spellSlots: [{ level: 1, total: 4, used: 1 }],
		});
	});

	it("maps calculated class spell slots and pact slots when overrides are empty", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.url = "/character-sheets/658ded7cf2bd044142897fb6";
		sheet.name.rus = "Алиса";
		sheet.data.info.classes.value = [
			{ className: "Волшебник", level: 5 },
			{ className: "Колдун", level: 3 },
		];
		sheet.data.vitality["hp-max"].value = 30;
		sheet.data.vitality["hp-current"].value = 24;
		sheet.data.vitality["hp-temp"].value = 0;
		sheet.data.vitality.ac.value = 17;
		sheet.data.vitality.initiative.value = 3;
		sheet.data.vitality["passive-perception"].value = 14;
		sheet.data.spells.levels["1"].slotsUsed = [true, false, false, false];
		sheet.data.spells.levels["2"].slotsUsed = [true, false, false];
		sheet.data.spells.pact = {
			slotLevel: 2,
			slotCountOverride: null,
			slotsUsed: [true, false],
		};

		const participant = mapCharacterSheetToEncounterParticipant(sheet);

		expect(participant?.spellSlots).toEqual([
			{ level: 1, total: 4, used: 1 },
			{ level: 2, total: 3, used: 1 },
			{ level: 3, total: 2, used: 0 },
			{ level: 2, total: 2, used: 1 },
		]);
	});

	it("returns null when required combat fields are missing", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.name.rus = "Алиса";
		sheet.data.vitality["hp-max"].value = Number.NaN;

		expect(mapCharacterSheetToEncounterParticipant(sheet)).toBeNull();
	});
});
