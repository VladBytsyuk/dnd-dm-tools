import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/svelte";
import type { MarkdownRenderChild } from "obsidian";
import { registerEncounterMdCodeBlockProcessor } from "src/ui/components/processor/encounter_md_code_block_processor";

const participant = { id: 1, name: "Гоблин", initiative: 12, initiativeModifier: 2, hpCurrent: 7, hpTemporary: 0, hpMax: 7, armorClass: 15, passivePerception: 9, side: "enemy", isDead: false, conditions: [] };
const mounted: MarkdownRenderChild[] = [];
afterEach(() => { mounted.splice(0).forEach((child) => child.onunload()); document.body.replaceChildren(); });
function setup() {
	let process: (source: string, element: HTMLElement, context: { addChild: (child: MarkdownRenderChild) => void }) => Promise<void>;
	const plugin = { app: {}, registerMarkdownCodeBlockProcessor: vi.fn((_kind: string, handler: typeof process) => { process = handler; }) };
	const repository = { getFullItemByUrl: vi.fn(async () => null) };
	registerEncounterMdCodeBlockProcessor(plugin as any, repository as any, repository as any, { onImageRequested: vi.fn(async () => "") } as any);
	const element = document.createElement("div"); document.body.append(element);
	return { element, render: (source: string) => process(source, element, { addChild: (child) => mounted.push(child) }) };
}

describe("embedded encounter processor", () => {
	it("renders the complete read-only tracker and unmounts it with its Markdown child", async () => {
		const test = setup();
		await test.render(JSON.stringify({ name: "Засада", participants: [participant] }));
		expect(await screen.findByText("Засада")).toBeTruthy();
		expect(screen.getByText("Гоблин")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Копировать столкновение" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Начать столкновение" })).toBeNull();
		expect(test.element.querySelector(".tracker")).toBeTruthy();
		mounted.pop()!.onunload();
		await waitFor(() => expect(test.element.querySelector(".tracker")).toBeNull());
	});
	it.each([{ name: "Неверный", participants: null }, { name: "Повтор ID", participants: [participant, participant] }])("shows a malformed encounter error without mounting a broken tracker", async (value) => {
		const test = setup(); await test.render(JSON.stringify(value));
		expect(test.element.textContent).toBe("Некорректный блок encounter.");
		expect(test.element.querySelector(".tracker")).toBeNull();
		expect(mounted).toHaveLength(0);
	});
});
