import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { theme, Theme } from "src/ui/theme";
import FiltersOverlay from "src/ui/layout/uikit/FiltersOverlay.svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";

afterEach(cleanup);

const fullFilters = { sources: ["Книга игрока", "Бестиарий"], levels: [0, 1, 2] };
const filterConfig = [{ key: "sources", label: "Источник" }, { key: "levels", label: "Уровень" }];

function overlay(redesignEnabled = true) {
	const initialFilters = { sources: ["Книга игрока"], levels: [] };
	const onApply = vi.fn(), onClose = vi.fn();
	const view = render(FiltersOverlay, { fullFilters, initialFilters, filterConfig, redesignEnabled, panelKey: "spellbook", onApply, onClose });
	return { ...view, initialFilters, onApply, onClose, user: userEvent.setup() };
}

function panel(redesignEnabled = true) {
	const repository = {
		createEmptyFullItem: () => undefined,
		getAllFilters: vi.fn().mockResolvedValue(fullFilters),
		getFilteredSmallItems: vi.fn().mockResolvedValue([]),
		groupItems: vi.fn().mockResolvedValue([]),
	};
	const view = render(BaseSidePanelUi, {
		panelKey: "spellbook", redesignEnabled, repository,
		initialFilters: { sources: [], levels: [] }, filterConfig,
		groupTitleBuilder: (group: { sort: string }) => group.sort,
		uiEventListener: {}, FullItemSlot: undefined, SmallItemSlot: undefined,
	});
	return { ...view, repository, user: userEvent.setup() };
}

describe("redesigned filters", () => {
	it("keeps design system chips undimmed with selection, keyboard toggling and reactive theme", async () => {
		const previousTheme = get(theme);
		try {
			theme.set(Theme.Dark);
			const test = overlay();
			const button = screen.getByRole("button", { name: "Бестиарий", exact: true });
			const chip = button.querySelector(".chip")!;
			expect(chip.getAttribute("data-theme")).toBe("dark");
			expect(chip.classList.contains("inactive")).toBe(false);
			expect(chip.getAttribute("data-active")).toBe("false");
			await test.user.click(button);
			expect(chip.getAttribute("data-active")).toBe("true");
			expect(chip.classList.contains("inactive")).toBe(false);
			expect(button.getAttribute("aria-pressed")).toBe("true");
			await test.user.keyboard(" ");
			expect(chip.getAttribute("data-active")).toBe("false");
			expect(chip.classList.contains("inactive")).toBe(false);
			expect(button.getAttribute("aria-pressed")).toBe("false");
			theme.set(Theme.Light);
			await waitFor(() => expect(chip.getAttribute("data-theme")).toBe("light"));
		} finally {
			theme.set(previousTheme);
		}
	});

	it("opens all groups by default and edits a draft until Apply, including numeric zero", async () => {
		const test = overlay();
		expect(screen.getByText("Источник", { selector: "summary" }).closest("details")?.open).toBe(true);
		const level = screen.getByText("Уровень", { selector: "summary" });
		expect(level.closest("details")?.open).toBe(true);
		await test.user.click(screen.getByRole("button", { name: "Бестиарий", exact: true }));
		await test.user.click(level);
		expect(level.closest("details")?.open).toBe(false);
		await test.user.click(level);
		await test.user.click(screen.getByRole("button", { name: "0", exact: true }));
		expect(screen.getByRole("button", { name: "0", exact: true }).getAttribute("aria-pressed")).toBe("true");
		expect(test.onApply).not.toHaveBeenCalled();
		expect(test.initialFilters).toEqual({ sources: ["Книга игрока"], levels: [] });
		await test.user.click(screen.getByRole("button", { name: "Применить" }));
		expect(test.onApply).toHaveBeenCalledOnce();
		expect(test.onApply).toHaveBeenCalledWith({ sources: ["Книга игрока", "Бестиарий"], levels: [0] });
		expect(test.onClose).toHaveBeenCalledOnce();
	});

	it.each(["close", "escape", "backdrop"])("discards draft changes on %s", async (method) => {
		const test = overlay();
		await test.user.click(screen.getByRole("button", { name: "Книга игрока", exact: true }));
		expect(screen.getByText("Источник", { selector: "summary" }).closest("details")?.open).toBe(true);
		if (method === "close") await test.user.click(screen.getByRole("button", { name: "Закрыть фильтры", exact: true }));
		else if (method === "escape") await test.user.keyboard("{Escape}");
		else await test.user.click(screen.getByRole("button", { name: "Закрыть фильтры без применения" }));
		expect(test.onClose).toHaveBeenCalledOnce();
		expect(test.onApply).not.toHaveBeenCalled();
		expect(test.initialFilters.sources).toEqual(["Книга игрока"]);
	});

	it("focuses Close and cycles keyboard focus through visible controls", async () => {
		const test = overlay();
		const close = screen.getByRole("button", { name: "Закрыть фильтры", exact: true });
		const apply = screen.getByRole("button", { name: "Применить" });
		expect(document.activeElement).toBe(close);
		await test.user.tab({ shift: true });
		expect(document.activeElement).toBe(apply);
		await test.user.tab();
		expect(document.activeElement).toBe(close);
	});

	it("preserves the legacy modal and initially collapsed groups", async () => {
		const test = overlay(false);
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(test.container.querySelector(".filters-overlay")).toBeTruthy();
		const group = screen.getByRole("button", { name: "> Источник", exact: true });
		expect(group.getAttribute("aria-expanded")).toBe("false");
		await test.user.click(group);
		await test.user.click(screen.getByRole("button", { name: "Бестиарий", exact: true }));
		await test.user.click(screen.getByRole("button", { name: "Применить" }));
		expect(test.onApply).toHaveBeenCalledWith({ sources: ["Книга игрока", "Бестиарий"], levels: [] });
	});
});

describe("filters in the list panel", () => {
	it("keeps the list mounted and locked, restores focus, and reopens the last applied selection", async () => {
		const test = panel();
		await waitFor(() => expect(test.repository.groupItems).toHaveBeenCalledOnce());
		const trigger = screen.getByRole("button", { name: "Фильтры", exact: true });
		const list = test.container.querySelector<HTMLElement>(".content")!;
		list.scrollTop = 145;
		await test.user.click(trigger);
		expect(test.container.querySelector(".side-panel-main")?.contains(screen.getByRole("dialog"))).toBe(true);
		expect(test.container.querySelector<HTMLElement>(".side-panel-toolbar")?.inert).toBe(true);
		expect(test.container.querySelector<HTMLElement>(".side-panel-view")?.inert).toBe(true);
		await test.user.click(screen.getByRole("button", { name: "Бестиарий", exact: true }));
		await test.user.click(screen.getByText("Источник", { selector: "summary" }));
		expect(test.repository.getFilteredSmallItems).toHaveBeenCalledOnce();
		await test.user.keyboard("{Escape}");
		await waitFor(() => expect(document.activeElement).toBe(trigger));
		expect(test.container.querySelector(".content")).toBe(list);
		expect(list.scrollTop).toBe(145);
		expect(test.container.querySelector<HTMLElement>(".side-panel-view")?.inert).toBe(false);
		await test.user.click(trigger);
		expect(screen.getByText("Источник", { selector: "summary" }).closest("details")?.open).toBe(true);
		const source = screen.getByRole("button", { name: "Бестиарий", exact: true });
		expect(source.getAttribute("aria-pressed")).toBe("false");
		await test.user.click(source);
		await test.user.click(screen.getByRole("button", { name: "Применить" }));
		await waitFor(() => expect(test.repository.getFilteredSmallItems).toHaveBeenLastCalledWith("", { sources: ["Бестиарий"], levels: [] }));
		await waitFor(() => expect(document.activeElement).toBe(trigger));
		await test.user.click(trigger);
		expect(screen.getByText("Источник", { selector: "summary" }).closest("details")?.open).toBe(true);
		expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Бестиарий", exact: true }).getAttribute("aria-pressed")).toBe("true");
	});

	it("retains display and apply transforms for race ability filters", async () => {
		const repository = {
			createEmptyFullItem: () => undefined,
			getAllFilters: vi.fn().mockResolvedValue({ abilities: ["STRENGTH", "DEXTERITY"] }),
			getFilteredSmallItems: vi.fn().mockResolvedValue([]), groupItems: vi.fn().mockResolvedValue([]),
		};
		const labels: Record<string, string> = { STRENGTH: "Сила", DEXTERITY: "Ловкость" };
		render(BaseSidePanelUi, {
			panelKey: "races", redesignEnabled: true, repository,
			initialFilters: { abilities: ["STRENGTH"] }, filterConfig: [{ key: "abilities", label: "Способности" }],
			filterDisplayTransform: (filters: { abilities: string[] }) => ({ abilities: filters.abilities.map((key) => labels[key]) }),
			filterApplyTransform: (filters: { abilities: string[] }) => ({ abilities: filters.abilities.map((label) => Object.keys(labels).find((key) => labels[key] === label)) }),
			groupTitleBuilder: () => "", uiEventListener: {}, FullItemSlot: undefined, SmallItemSlot: undefined,
		});
		await fireEvent.click(screen.getByRole("button", { name: "Фильтры", exact: true }));
		await fireEvent.click(await screen.findByRole("button", { name: "Ловкость", exact: true }));
		await fireEvent.click(screen.getByRole("button", { name: "Применить" }));
		await waitFor(() => expect(repository.getFilteredSmallItems).toHaveBeenLastCalledWith("", { abilities: ["STRENGTH", "DEXTERITY"] }));
	});
});
