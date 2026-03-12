import { describe, expect, it } from "vitest";
import { calculateSpellSlotProgression } from "src/domain/utils/characterSpellcasting";

describe("characterSpellcasting", () => {
	it("should calculate full caster slots", () => {
		const progression = calculateSpellSlotProgression([
			{ className: "Wizard", level: 5 }
		]);

		expect(progression.slots[1]).toBe(4);
		expect(progression.slots[2]).toBe(3);
		expect(progression.slots[3]).toBe(2);
		expect(progression.pact).toBeNull();
	});

	it("should calculate PHB multiclass slots", () => {
		const progression = calculateSpellSlotProgression([
			{ className: "Wizard", level: 3 },
			{ className: "Cleric", level: 2 }
		]);

		expect(progression.slots[1]).toBe(4);
		expect(progression.slots[2]).toBe(3);
		expect(progression.slots[3]).toBe(2);
	});

	it("should round artificer and paladin correctly", () => {
		const progression = calculateSpellSlotProgression([
			{ className: "Artificer", level: 1 },
			{ className: "Paladin", level: 3 }
		]);

		expect(progression.slots[1]).toBe(3);
		expect(progression.slots[2]).toBe(0);
	});

	it("should only count eldritch knight and arcane trickster as one-third casters", () => {
		const progression = calculateSpellSlotProgression([
			{ className: "Fighter", subclassName: "Eldritch Knight", level: 6 },
			{ className: "Rogue", subclassName: "Arcane Trickster", level: 3 }
		]);

		expect(progression.slots[1]).toBe(4);
		expect(progression.slots[2]).toBe(2);
	});

	it("should track warlock pact slots separately", () => {
		const progression = calculateSpellSlotProgression([
			{ className: "Колдун", level: 5 },
			{ className: "Чародей", level: 4 }
		]);

		expect(progression.slots[1]).toBe(4);
		expect(progression.slots[2]).toBe(3);
		expect(progression.pact).toEqual({
			slotLevel: 3,
			slotCount: 2,
		});
	});
});
