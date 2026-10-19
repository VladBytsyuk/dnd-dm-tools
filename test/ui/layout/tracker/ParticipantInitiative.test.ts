import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import InitiativeTracker from "src/ui/layout/tracker/InitiativeTracker.svelte";
import { EncounterManager } from "src/domain/models/encounter/EncounterManager";
import type { EncounterParticipant } from "src/domain/models/encounter/EncounterParticipant";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function setup(modifier: number, isEditable = true) {
	const participant: EncounterParticipant = { id: 1, name: "Гоблин", initiative: 18, initiativeModifier: modifier, hpCurrent: 7, hpTemporary: 0, hpMax: 7, armorClass: 15, passivePerception: 9, side: "enemy", isDead: false, conditions: [] };
	const encounter = { name: "Засада", participants: [participant, { ...participant, id: 2, name: "Волк", initiative: 7 }] };
	const manager = new EncounterManager(encounter);
	const view = render(InitiativeTracker, { app: {}, encounter, manager, isEditable, onPortraitClick: vi.fn(), onConditionClick: vi.fn(), onImageRequested: vi.fn(async () => ""), onOwlbearSnapshotCreated: vi.fn(async () => {}), onOwlbearTurnChanged: vi.fn(async () => {}) });
	return { manager, view };
}

describe("participant initiative roll", () => {
	it.each([-2, 0, 4])("rolls a d20 with modifier %s, updates only that participant and supports undo", async (modifier) => {
		const { manager } = setup(modifier), before = manager.current;
		const random = vi.spyOn(Math, "random").mockReturnValue(0.45);
		await fireEvent.click(screen.getAllByRole("button", { name: "Бросить инициативу" })[0]);
		expect(random).toHaveBeenCalledOnce();
		expect(manager.current.encounter.participants[0]).toEqual({ ...before.encounter.participants[0], initiative: 10 + modifier });
		expect(manager.current.encounter.participants[1]).toEqual(before.encounter.participants[1]);
		expect((screen.getAllByRole("textbox", { name: "Инициатива" })[0] as HTMLInputElement).value).toBe(String(10 + modifier));
		await fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
		expect(manager.current).toEqual(before);
	});
	it("activates with the keyboard and rerolls an already set initiative", async () => {
		const { manager } = setup(3), user = userEvent.setup();
		const random = vi.spyOn(Math, "random").mockReturnValue(0);
		const button = screen.getAllByRole("button", { name: "Бросить инициативу" })[0];
		button.focus(); await user.keyboard("{Enter}");
		expect(manager.current.encounter.participants[0].initiative).toBe(4);
		random.mockReturnValue(0.99);
		await user.keyboard(" ");
		expect(manager.current.encounter.participants[0].initiative).toBe(23);
		expect(manager.current.encounter.participants[1].initiative).toBe(7);
	});
	it("keeps initiative read-only in embedded encounters", async () => {
		const { manager } = setup(2, false), before = manager.current;
		const random = vi.spyOn(Math, "random");
		expect(screen.queryByRole("button", { name: "Бросить инициативу" })).toBeNull();
		await fireEvent.click(screen.getAllByLabelText("Инициатива").find((item) => item.tagName === "DIV")!);
		expect(random).not.toHaveBeenCalled();
		expect(manager.current).toEqual(before);
	});
});
