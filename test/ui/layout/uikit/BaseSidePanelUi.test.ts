import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tick } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import { EmptyFullMonster } from "src/domain/models/monster/FullMonster";
import { EmptyFullRace } from "src/domain/models/race/FullRace";
import type { BaseItem } from "src/domain/models/common/BaseItem";

let originalArrayLast: PropertyDescriptor | undefined;
beforeEach(() => {
	(HTMLElement.prototype as any).empty = function () { this.replaceChildren(); };
	originalArrayLast = Object.getOwnPropertyDescriptor(Array.prototype, "last");
	Object.defineProperty(Array.prototype, "last", { configurable: true, value(this: unknown[]) { return this[this.length - 1]; } });
});
afterEach(() => {
	cleanup();
	delete (HTMLElement.prototype as any).empty;
	if (originalArrayLast) Object.defineProperty(Array.prototype, "last", originalArrayLast);
	else delete (Array.prototype as any).last;
	vi.unstubAllGlobals();
});

function setup(options: { panelKey?: "bestiary" | "races"; item?: BaseItem } = {}) {
	const item = options.item ?? { ...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster", origin: "manual" as const };
	let currentItem = item;
	let items = [item];
	const externalListeners = new Set<(url: string) => void>();
	const unsubscribeExternal = vi.fn((listener: (url: string) => void) => externalListeners.delete(listener));
	const favorites = new Set<string>();
	const repository = {
		createEmptyFullItem: () => undefined,
		getAllSmallItems: vi.fn(async () => items),
		getFilteredSmallItems: vi.fn(async () => items),
		groupItems: vi.fn(async (items: unknown[]) => items.length ? [{ sort: "0", smallItems: items }] : []),
		getFullItemBySmallItem: vi.fn(async () => currentItem),
		getFullItemByUrl: vi.fn(async () => currentItem),
		subscribeExternalChanges: vi.fn((listener: (url: string) => void) => {
			externalListeners.add(listener);
			return () => { unsubscribeExternal(listener); };
		}),
		putItem: vi.fn(async (_item: unknown, _context: unknown) => ({ ok: true })),
		deleteItem: vi.fn(async () => { items = []; return true; }),
		favorites: {
			listUrls: () => [...favorites],
			set: vi.fn(async (_kind: string, url: string, selected: boolean) => { if (selected) favorites.add(url); else favorites.delete(url); }),
		},
	};
	const view = render(BaseSidePanelUi, {
		panelKey: options.panelKey ?? "bestiary", initialFilters: {}, repository,
		filterConfig: [], groupTitleBuilder: () => "Существа",
		uiEventListener: { onImageRequested: vi.fn() },
	});
	return {
		...view, repository, item, unsubscribeExternal,
		externalChange(name: string, url = item.url) {
			currentItem = { ...currentItem, name: { ...currentItem.name, rus: name } };
			items = [currentItem];
			for (const listener of externalListeners) listener(url);
		},
		externalUpdate<T extends BaseItem>(next: T, url = next.url) {
			currentItem = next;
			items = [next];
			for (const listener of externalListeners) listener(url);
		},
		externalDelete(url = item.url) {
			items = items.filter(entry => entry.url !== url);
			for (const listener of externalListeners) listener(url);
		},
	};
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

describe("external entity changes", () => {
	it("refreshes the list without fetching full cards", async () => {
		const test = setup();
		await screen.findByText("Монстр");
		test.externalChange("Обновлённый монстр");
		await screen.findByText("Обновлённый монстр");
		expect(screen.queryByText("Монстр")).toBeNull();
		expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2);
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
	});

	it("refreshes the open clean card and its list after an external update", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		test.externalChange("Обновлённая карточка");
		await screen.findByText("Обновлённая карточка");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledWith(test.item.url);
		expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2);
		await fireEvent.click(screen.getByRole("button", { name: "Назад", exact: true }));
		await screen.findByText("Обновлённая карточка");
		expect(test.container.querySelector(".redesigned-full-item")).toBeNull();
	});

	it("preserves unsaved edits and applies the deferred update after cancelling", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(await screen.findByDisplayValue("Монстр"), { target: { value: "Несохранённый черновик" } });
		test.externalChange("Сохранено через MCP");
		await waitFor(() => expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2));
		expect(screen.getByDisplayValue("Несохранённый черновик")).toBeTruthy();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
		expect(test.repository.putItem).not.toHaveBeenCalled();
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		await screen.findByText("Сохранено через MCP");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledWith(test.item.url);
	});

	it("keeps the current card when an unrelated entity changes", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		test.externalChange("Другой монстр", "/bestiary/another-monster");
		await waitFor(() => expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2));
		expect(screen.getByText("Монстр")).toBeTruthy();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
	});

	it("preserves a draft opened while an external card refresh is still loading", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		let finishRefresh!: (item: typeof test.item) => void;
		test.repository.getFullItemByUrl.mockImplementationOnce(() => new Promise(resolve => { finishRefresh = resolve; }));
		test.externalChange("Внешнее обновление");
		await waitFor(() => expect(test.repository.getFullItemByUrl).toHaveBeenCalledOnce());
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(await screen.findByDisplayValue("Монстр"), { target: { value: "Черновик во время загрузки" } });
		finishRefresh({ ...test.item, name: { ...test.item.name, rus: "Внешнее обновление" } });
		await tick();
		expect(screen.getByDisplayValue("Черновик во время загрузки")).toBeTruthy();
		expect(test.repository.putItem).not.toHaveBeenCalled();
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		await screen.findByText("Внешнее обновление");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledTimes(2);
	});

	it("unsubscribes on unmount and ignores later external events", async () => {
		const test = setup();
		await screen.findByText("Монстр");
		expect(test.repository.subscribeExternalChanges).toHaveBeenCalledOnce();
		test.unmount();
		expect(test.unsubscribeExternal).toHaveBeenCalledOnce();
		test.externalChange("Изменение после закрытия");
		expect(test.repository.getFilteredSmallItems).toHaveBeenCalledOnce();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
	});

	it("closes a deleted clean card without attempting a remote full-card load", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		test.externalDelete();
		await waitFor(() => expect(test.container.querySelector(".redesigned-full-item")).toBeNull());
		expect(screen.queryByText("Монстр")).toBeNull();
		expect(test.repository.getAllSmallItems).toHaveBeenCalledOnce();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
		expect(test.repository.putItem).not.toHaveBeenCalled();
	});

	it("preserves a deleted card's unsaved draft until cancellation, then closes it locally", async () => {
		const test = setup();
		await fireEvent.click(await screen.findByText("Монстр"));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(await screen.findByDisplayValue("Монстр"), { target: { value: "Черновик удалённой карточки" } });
		test.externalDelete();
		await waitFor(() => expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2));
		expect(screen.getByDisplayValue("Черновик удалённой карточки")).toBeTruthy();
		expect(test.repository.getAllSmallItems).not.toHaveBeenCalled();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		await waitFor(() => expect(test.container.querySelector(".redesigned-full-item")).toBeNull());
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
		expect(test.repository.putItem).not.toHaveBeenCalled();
	});
});

describe("external changes to open race trees", () => {
	function races() {
		const descendant = { ...EmptyFullRace(), name: { rus: "Дочерняя подраса", eng: "Descendant" }, url: "/races/descendant", origin: "manual" as const };
		const child = { ...EmptyFullRace(), name: { rus: "Подраса", eng: "Child" }, url: "/races/child", origin: "manual" as const, subraces: [descendant] };
		const parent = { ...EmptyFullRace(), name: { rus: "Родительская раса", eng: "Parent" }, url: "/races/parent", origin: "manual" as const, subraces: [child] };
		return { parent, child, descendant };
	}

	it("refreshes an open parent when a nested descendant changes", async () => {
		const { parent, descendant } = races();
		const test = setup({ panelKey: "races", item: parent });
		await fireEvent.click(await screen.findByText("Родительская раса"));
		test.externalUpdate({ ...parent, description: "Обновлённая родительская карточка" }, descendant.url);
		await screen.findByText("Обновлённая родительская карточка");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledWith(parent.url);
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalledWith(descendant.url);
	});

	it("keeps an edited parent draft until cancellation after a descendant changes", async () => {
		const { parent, child } = races();
		const test = setup({ panelKey: "races", item: parent });
		await fireEvent.click(await screen.findByText("Родительская раса"));
		await fireEvent.click(screen.getByRole("button", { name: "Редактировать", exact: true }));
		await fireEvent.input(await screen.findByDisplayValue("Родительская раса"), { target: { value: "Несохранённая раса" } });
		test.externalUpdate({ ...parent, description: "Обновление связанной подрасы" }, child.url);
		await waitFor(() => expect(test.repository.getFilteredSmallItems).toHaveBeenCalledTimes(2));
		expect(screen.getByDisplayValue("Несохранённая раса")).toBeTruthy();
		expect(test.repository.getFullItemByUrl).not.toHaveBeenCalled();
		await fireEvent.click(screen.getByRole("button", { name: "Отмена", exact: true }));
		await screen.findByText("Обновление связанной подрасы");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledWith(parent.url);
		expect(test.repository.putItem).not.toHaveBeenCalled();
	});

	it("recognizes an open subrace in the local parent tree before refreshing it", async () => {
		const { parent, child } = races();
		const test = setup({ panelKey: "races", item: child });
		test.repository.getAllSmallItems.mockResolvedValue([parent]);
		await fireEvent.click(await screen.findByText("Подраса"));
		test.externalUpdate({ ...child, description: "Обновлённая вложенная подраса" });
		await screen.findByText("Обновлённая вложенная подраса");
		expect(test.repository.getFullItemByUrl).toHaveBeenCalledWith(child.url);
		expect(test.container.querySelector(".redesigned-full-item")).toBeTruthy();
	});
});
