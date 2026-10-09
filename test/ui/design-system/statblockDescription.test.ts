import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import RedesignedFullItem from "src/ui/design-system/RedesignedFullItem.svelte";
import { EmptyFullMonster } from "src/domain/models/monster/FullMonster";

describe("statblock description editing", () => {
	afterEach(() => { delete (HTMLElement.prototype as any).empty; });

	it.each([undefined, "", "<p>Исходное описание</p>"])("saves an edited description starting from %s", async (description) => {
		(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
		const monster = {
			...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" },
			url: "/bestiary/monster", origin: "manual", description,
		};
		const onItemSave = vi.fn(async (_item: any) => ({ ok: true }));
		const props = {
			panelKey: "bestiary" as const, currentItem: monster,
			uiEventListener: { onImageRequested: vi.fn() } as any, onItemSave,
			actionRequest: { id: 1, command: "edit" as const },
		};
		const { container, rerender } = render(RedesignedFullItem, props);
		await screen.findByDisplayValue("Описание");
		const descriptionBlock = Array.from(container.querySelectorAll(".filled-text-block"))
			.find(block => block.querySelector<HTMLInputElement>("input")?.value === "Описание")!;
		const input = descriptionBlock.querySelector("textarea")!;
		expect(input.value).toBe(description ?? "");
		await fireEvent.input(input, { target: { value: "<p>Изменённое описание</p>" } });
		await rerender({ ...props, actionRequest: { id: 2, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledOnce());
		expect(onItemSave.mock.calls[0][0].description).toBe("<p>Изменённое описание</p>");

		props.currentItem = onItemSave.mock.calls[0][0];
		await rerender({ ...props, actionRequest: { id: 3, command: "edit" } });
		await screen.findByDisplayValue("<p>Изменённое описание</p>");
		await rerender({ ...props, actionRequest: { id: 4, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledTimes(2));
		expect(onItemSave.mock.calls[1][0].description).toBe("<p>Изменённое описание</p>");
	});

	it("preserves the description when changing another field or cancelling, and allows clearing it explicitly", async () => {
		(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
		const description = "<p>Описание с <strong>форматированием</strong></p>";
		const monster = {
			...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" },
			url: "/bestiary/monster", origin: "manual", description,
		};
		const onItemSave = vi.fn(async (_item: any) => ({ ok: true }));
		const props = {
			panelKey: "bestiary" as const, currentItem: monster,
			uiEventListener: { onImageRequested: vi.fn() } as any, onItemSave,
			actionRequest: { id: 1, command: "edit" as const },
		};
		const { rerender } = render(RedesignedFullItem, props);
		await screen.findByDisplayValue(description);
		await fireEvent.input(screen.getByDisplayValue("Монстр"), { target: { value: "Новое имя" } });
		await rerender({ ...props, actionRequest: { id: 2, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledOnce());
		expect(onItemSave.mock.calls[0][0]).toMatchObject({ name: { rus: "Новое имя" }, description });

		props.currentItem = onItemSave.mock.calls[0][0];
		await rerender({ ...props, actionRequest: { id: 3, command: "edit" } });
		await fireEvent.input(await screen.findByDisplayValue(description), { target: { value: "Отменяемое изменение" } });
		await rerender({ ...props, actionRequest: { id: 4, command: "cancel" } });
		expect(onItemSave).toHaveBeenCalledOnce();
		await rerender({ ...props, actionRequest: { id: 5, command: "edit" } });
		await fireEvent.input(await screen.findByDisplayValue(description), { target: { value: "" } });
		await rerender({ ...props, actionRequest: { id: 6, command: "save" } });
		await waitFor(() => expect(onItemSave).toHaveBeenCalledTimes(2));
		expect(onItemSave.mock.calls[1][0].description).toBe("");
	});
});
