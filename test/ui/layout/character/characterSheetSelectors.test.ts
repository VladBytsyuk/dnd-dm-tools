import { describe, expect, it } from "vitest";
import { EmptyFullCharacterSheet } from "../../../../src/domain/models/character/FullCharacterSheet";
import {
	CHARACTER_ABILITY_GROUPS,
	getCharacterCoins,
	getCharacterHeaderInfo,
	getCharacterSaves,
	getCharacterStats,
	getCharacterVitality,
} from "../../../../src/ui/layout/character/characterSheetSelectors";

describe("characterSheetSelectors", () => {
	it("should build header info from character data", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.info.classes = {
			name: "classes",
			value: [{ className: "Wizard", level: 3 }],
		};
		sheet.data.info.level.value = 3;
		sheet.data.info.race.value = "Elf";
		sheet.data.info.background.value = "Sage";
		sheet.data.info.playerName.value = "Player";
		sheet.data.info.alignment.value = "Neutral";
		sheet.data.info.experience.value = "900";

		expect(getCharacterHeaderInfo(sheet.data)).toEqual({
			classes: [{ className: "Wizard", level: 3 }],
			level: 3,
			race: "Elf",
			background: "Sage",
			playerName: "Player",
			alignment: "Neutral",
			experience: 900,
		});
	});

	it("should calculate modifiers from scores when building stats", () => {
		const sheet = EmptyFullCharacterSheet();
		sheet.data.stats.str.score = 18;
		sheet.data.stats.dex.score = 8;

		const stats = getCharacterStats(sheet.data);

		expect(stats.str.modifier).toBe(4);
		expect(stats.dex.modifier).toBe(-1);
	});

	it("should return default vitality and coin values safely", () => {
		const sheet = EmptyFullCharacterSheet();
		const vitality = getCharacterVitality(sheet.data);
		const coins = getCharacterCoins(sheet.data);

		expect(vitality.ac.value).toBe(10);
		expect(vitality["hp-current"].value).toBe(0);
		expect(coins?.gp.value).toBe(0);
		expect(getCharacterSaves(sheet.data).wis.isProf).toBe(false);
		expect(CHARACTER_ABILITY_GROUPS).toHaveLength(6);
	});
});
