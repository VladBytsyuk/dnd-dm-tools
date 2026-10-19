import { describe, expect, it, vi } from "vitest";
import { EncounterManager } from "src/domain/models/encounter/EncounterManager";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import type { EncounterParticipant } from "src/domain/models/encounter/EncounterParticipant";

function participant(id: number, name: string): EncounterParticipant {
	return { id, name, initiative: 18, initiativeModifier: 3, hpCurrent: 7, hpTemporary: 2, hpMax: 12, armorClass: 14, passivePerception: 13, side: "pc", isDead: false, conditions: [{ url: "/screens/poisoned", expiresOnRound: 5 }], spellSlots: [{ level: 1, total: 4, used: 2 }], resources: [{ id: "rage", name: "Ярость", total: 3, used: 1 }], isConcentrating: true, imageUrl: "hero.png", url: "/bestiary/hero", colorHex: "#ffffff", owlbearItemId: "token" };
}

describe("adding a read-only encounter to the current tracker", () => {
	it("replaces the name, resets only current initiatives, appends independent copies and supports one-step undo/redo", () => {
		const manager = new EncounterManager({ name: "Текущий бой", participants: [participant(0, "Герой"), participant(2, "Спутник")] });
		manager.startEncounter(); manager.nextStepEncounter(); manager.nextStepEncounter();
		const before = manager.current;
		const source: Encounter = { name: "Засада", participants: [participant(0, "Гоблин"), participant(2, "Волк")] };
		const sourceBefore = structuredClone(source), update = vi.fn(); manager.setOnUpdate(update);
		manager.addEncounter(source);
		const added = manager.current;
		expect(added.encounter.name).toBe("Засада");
		expect(added.encounter.participants.slice(0, 2)).toEqual(before.encounter.participants.map((item) => ({ ...item, initiative: 0 })));
		expect(added.encounter.participants.slice(2)).toEqual(source.participants.map((item) => ({ ...item, id: expect.any(Number) })));
		expect(new Set(added.encounter.participants.map((item) => item.id)).size).toBe(4);
		expect(added.activeParticipantIndex).toBeNull(); expect(added.round).toBe(1);
		expect(update).toHaveBeenCalledOnce(); expect(source).toEqual(sourceBefore);
		source.participants[0].conditions[0].expiresOnRound = 99;
		expect(manager.current).toEqual(added);
		manager.undo(); expect(manager.current).toEqual(before);
		manager.redo(); expect(manager.current).toEqual(added);
	});
	it("keeps duplicate names as separate participants and assigns unique IDs on repeated additions", () => {
		const manager = new EncounterManager({ name: "", participants: [] });
		const source = { name: "Засада", participants: [participant(0, "Гоблин"), participant(1, "Гоблин")] };
		manager.addEncounter(source); manager.addEncounter(source);
		expect(manager.current.encounter.participants.map((item) => item.name)).toEqual(Array(4).fill("Гоблин"));
		expect(manager.current.encounter.participants.map((item) => item.initiative)).toEqual([0, 0, 18, 18]);
		expect(new Set(manager.current.encounter.participants.map((item) => item.id)).size).toBe(4);
	});
	it("accepts empty encounters without removing existing participants", () => {
		const current = participant(1, "Герой");
		const manager = new EncounterManager({ name: "Бой", participants: [current] });
		manager.addEncounter({ name: "", participants: [] });
		expect(manager.current.encounter).toEqual({ name: "", participants: [{ ...current, initiative: 0 }] });
	});
});
