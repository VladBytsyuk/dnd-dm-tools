import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import { EmptyFullMonster } from "src/domain/models/monster/FullMonster";

beforeEach(() => {
	(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
});
afterEach(() => {
	cleanup();
	delete (HTMLElement.prototype as any).empty;
	vi.unstubAllGlobals();
});

function setup() {
	const item = { ...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster", origin: "manual" as const };
	let items = [item];
	const favorites = new Set<string>();
	const repository = {
		createEmptyFullItem: () => undefined,
		getFilteredSmallItems: vi.fn(async () => items),
		groupItems: vi.fn(async (items: unknown[]) => items.length ? [{ sort: "0", smallItems: items }] : []),
		getFullItemBySmallItem: vi.fn(async () => item),
		putItem: vi.fn(async (_item: unknown, _context: unknown) => ({ ok: true })),
		deleteItem: vi.fn(async () => { items = []; return true; }),
		favorites: {
			listUrls: () => [...favorites],
			set: vi.fn(async (_kind: string, url: string, selected: boolean) => { if (selected) favorites.add(url); else favorites.delete(url); }),
		},
	};
	const view = render(BaseSidePanelUi, {
		panelKey: "bestiary", initialFilters: {}, repository,
		filterConfig: [], groupTitleBuilder: () => "Существа",
		uiEventListener: { onImageRequested: vi.fn() },
	});
	return { ...view, repository, item };
}

describe("permanent design in entity panels", () => {
	it("opens the new cards and connects favorites, editing, copying and deletion", async () => {
		const writeText = vi.fn(async () => {});
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		expect(test.container.querySelector(".redesigned-full-item")).toBeTruthy();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить в избранное", exact: true }));
		await waitFor(() => expect(test.repository.favorites.set).toHaveBeenCalledWith("bestiary", test.item.url, true));
		await screen.findByRole("button", { name: "Убрать из избранного", exact: true });
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(await screen.findByDisplayValue("Монстр"), { target: { value: "Изменённый монстр" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.repository.putItem).toHaveBeenCalledWith(expect.objectContaining({ name: { rus: "Изменённый монстр", eng: "Monster" } }), { originalUrl: test.item.url, originalOrigin: "manual" }));
		await fireEvent.click(await screen.findByRole("button", { name: "Копировать в буфер обмена", exact: true }));
		await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Изменённый монстр")));
		await fireEvent.click(screen.getByRole("button", { name: "Удалить", exact: true }));
		await waitFor(() => expect(test.repository.deleteItem).toHaveBeenCalledWith(test.item.url));
		await waitFor(() => expect(test.container.querySelector(".redesigned-full-item")).toBeNull());
	});

	it("creates an editable card using the shared empty entity fallback", async () => {
		const test = setup();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить", exact: true }));
		const url = await screen.findByDisplayValue("/bestiary/");
		await fireEvent.input(url, { target: { value: "/bestiary/new" } });
		await fireEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
		await waitFor(() => expect(test.repository.putItem).toHaveBeenCalledWith(expect.objectContaining({ url: "/bestiary/new" }), expect.any(Object)));
	});
});
