import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import type { MarkdownRenderChild } from "obsidian";
import { registerEncounterMdCodeBlockProcessor } from "src/ui/components/processor/encounter_md_code_block_processor";
import { EncounterManager } from "src/domain/models/encounter/EncounterManager";
import InitiativeTracker from "src/ui/layout/tracker/InitiativeTracker.svelte";
import type { Encounter } from "src/domain/models/encounter/Encounter";

const participant = { id: 1, name: "Гоблин", initiative: 12, initiativeModifier: 2, hpCurrent: 7, hpTemporary: 0, hpMax: 7, armorClass: 15, passivePerception: 9, side: "enemy", isDead: false, conditions: [] };
const mounted: MarkdownRenderChild[] = [];
afterEach(() => { cleanup(); mounted.splice(0).forEach((child) => child.onunload()); document.body.replaceChildren(); });
function setup() {
	let process: (source: string, element: HTMLElement, context: { addChild: (child: MarkdownRenderChild) => void }) => Promise<void>;
	const manager = new EncounterManager({ name: "", participants: [] });
	const openPanel = vi.fn(async () => {});
	const plugin = { app: {}, registerMarkdownCodeBlockProcessor: vi.fn((_kind: string, handler: typeof process) => { process = handler; }), addEncounterToTracker: vi.fn(async (value: Encounter) => { manager.addEncounter(value); await openPanel("initiative-tracker"); }) };
	const repository = { getFullItemByUrl: vi.fn(async () => null) };
	registerEncounterMdCodeBlockProcessor(plugin as any, repository as any, repository as any, { onImageRequested: vi.fn(async () => "") } as any);
	const element = document.createElement("div"); document.body.append(element);
	return { element, manager, plugin, openPanel, render: (source: string) => process(source, element, { addChild: (child) => mounted.push(child) }) };
}

describe("embedded encounter processor", () => {
	it("renders the complete read-only tracker and unmounts it with its Markdown child", async () => {
		const test = setup();
		await test.render(JSON.stringify({ name: "Засада", participants: [participant] }));
		expect(await screen.findByText("Засада")).toBeTruthy();
		expect(screen.getByText("Гоблин")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Копировать столкновение" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Копировать столкновение" }).nextElementSibling).toBe(screen.getByRole("button", { name: "Добавить в трекер" }));
		expect(screen.queryByRole("button", { name: "Начать столкновение" })).toBeNull();
		expect(test.element.querySelector(".tracker")).toBeTruthy();
		mounted.pop()!.onunload();
		await waitFor(() => expect(test.element.querySelector(".tracker")).toBeNull());
	});
	it("adds the read-only block to a mounted tracker without mutating its source and can undo the merge", async () => {
		const test = setup();
		test.manager.pasteEncounter({ name: "Текущий бой", participants: [{ ...participant, name: "Герой", hpCurrent: 3 }] });
		test.manager.startEncounter();
		const before = test.manager.current, onCombatChanged = vi.fn();
		const tracker = render(InitiativeTracker, { app: {}, encounter: { name: "", participants: [] }, manager: test.manager, isEditable: true, onPortraitClick: vi.fn(), onConditionClick: vi.fn(), onImageRequested: vi.fn(async () => ""), onOwlbearSnapshotCreated: vi.fn(async () => {}), onOwlbearTurnChanged: vi.fn(async () => {}), onCombatChanged });
		expect(within(tracker.container).queryByRole("button", { name: "Добавить в трекер" })).toBeNull();
		await test.render(JSON.stringify({ name: "Засада", participants: [participant] }));
		await fireEvent.click(await within(test.element).findByRole("button", { name: "Добавить в трекер" }));
		await waitFor(() => expect(test.openPanel).toHaveBeenCalledWith("initiative-tracker"));
		expect(within(tracker.container).getByDisplayValue("Засада")).toBeTruthy();
		expect(test.manager.current.encounter.participants.map((item) => [item.name, item.hpCurrent, item.initiative])).toEqual([["Герой", 3, 0], ["Гоблин", 7, 12]]);
		expect(within(test.element).getByText("Засада")).toBeTruthy();
		expect(within(test.element).queryByText("Герой")).toBeNull();
		expect(onCombatChanged).toHaveBeenCalledWith(false);
		await fireEvent.click(within(tracker.container).getByRole("button", { name: "Отменить" }));
		expect(test.manager.current).toEqual(before);
		tracker.unmount();
		await act(() => test.manager.addEncounter({ name: "После закрытия", participants: [] }));
	});
	it("queues data in a tracker that has not been mounted yet", async () => {
		const test = setup();
		await test.render(JSON.stringify({ name: "Засада", participants: [participant] }));
		await fireEvent.click(await within(test.element).findByRole("button", { name: "Добавить в трекер" }));
		expect(test.manager.current.encounter).toMatchObject({ name: "Засада", participants: [{ name: "Гоблин" }] });
		expect(test.openPanel).toHaveBeenCalledOnce();
	});
	it.each([{ name: "Неверный", participants: null }, { name: "Повтор ID", participants: [participant, participant] }])("shows a malformed encounter error without mounting a broken tracker", async (value) => {
		const test = setup(); await test.render(JSON.stringify(value));
		expect(test.element.textContent).toBe("Некорректный блок encounter.");
		expect(test.element.querySelector(".tracker")).toBeNull();
		expect(mounted).toHaveLength(0);
	});
});
