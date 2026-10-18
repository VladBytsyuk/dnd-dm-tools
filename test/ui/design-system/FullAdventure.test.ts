import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import FullAdventure, { type FullAdventureEntity } from "../../../design-system/src/lib/FullAdventure.svelte";
import FullAdventurePreview from "../../../design-system/src/lib/FullAdventurePreview.svelte";

const names = { russianName: "Дорога в Подземье", entityLink: "/adventure/underdark" };
const card = createRawSnippet<["dark" | "light"]>((theme) => ({ render: () => `<div>Карточка ${theme()}</div>` }));
const entities: FullAdventureEntity[] = [
	{ url: "/bestiary/ogremoch", label: "Огремох", card },
	{ url: "/bestiary/ogremoch", label: "Повтор Огремоха", card },
	{ url: "/items/bolts", label: "Арбалетные болты", card },
];

// jsdom has no layout observers; graph interactions are also checked in a browser.
beforeAll(() => {
	vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
	vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterAll(() => vi.unstubAllGlobals());

describe("FullAdventure", () => {
	it("deduplicates note entities in first-appearance order and passes the theme to snippets", () => {
		render(FullAdventure, { ...names, campaignName: "Культ Вазрона", entities, theme: "light", onEntityClick: vi.fn() });
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getAllByRole("button", { name: /^Открыть:/ }).map((button) => button.getAttribute("aria-label"))).toEqual(["Открыть: Огремох", "Открыть: Арбалетные болты"]);
		expect(screen.getAllByText("Карточка light")).toHaveLength(2);
		expect(screen.getByText("Культ Вазрона")).toBeTruthy();
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	it("routes opening a note, a playlist and entities separately", async () => {
		const onOpenNote = vi.fn();
		const onPlaylistClick = vi.fn();
		const onEntityClick = vi.fn();
		render(FullAdventure, { ...names, notePath: "Культ/Приключение.md", playlist: { id: "music", title: "Музыка подземелья", trackCount: 3 }, entities, onOpenNote, onPlaylistClick, onEntityClick });
		await fireEvent.click(screen.getByRole("link", { name: "Культ/Приключение.md" }));
		await fireEvent.keyDown(screen.getByRole("button", { name: "Музыка подземелья", exact: true }), { key: "Enter" });
		await fireEvent.keyDown(screen.getByRole("button", { name: "Открыть: Огремох" }), { key: "Enter" });
		await fireEvent.keyDown(screen.getByRole("button", { name: "Открыть: Арбалетные болты" }), { key: " " });
		expect(onOpenNote).toHaveBeenCalledWith("Культ/Приключение.md");
		expect(onPlaylistClick).toHaveBeenCalledWith("music");
		expect(onEntityClick.mock.calls).toEqual([["/bestiary/ogremoch"], ["/items/bolts"]]);
	});

	it("edits metadata and selects, replaces and removes each reference", async () => {
		const onNoteChange = vi.fn();
		const onPlaylistChange = vi.fn();
		const playlists = [{ id: "a", title: "Подземье" }, { id: "b", title: "Святилища" }];
		const source = { shortName: "PHB", name: "Player's Handbook", group: { shortName: "D&D", name: "D&D" } };
		const { rerender } = render(FullAdventure, { ...names, editable: true, source, availableNotes: ["Тоннель.md", "Храм.md"], availablePlaylists: playlists, onNoteChange, onPlaylistChange });
		expect(screen.queryByLabelText("Английское название")).toBeNull();
		for (const [label, value] of [["Русское название", "Забытые святилища"], ["Ссылка на сущность", "/adventure/temples"], ["Кампания", "Древний культ"], ["Краткое название источника", "DMG"]]) {
			await fireEvent.input(screen.getByLabelText(label), { target: { value } });
		}
		for (const [label, first, second, callback, values] of [
			["Заметка", "Тоннель.md", "Храм.md", onNoteChange, ["Тоннель.md", "Храм.md"]],
			["Плейлист", "Подземье", "Святилища", onPlaylistChange, playlists],
		] as const) {
			await fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
			await fireEvent.click(screen.getByRole("option", { name: first, exact: true }));
			expect(callback).toHaveBeenLastCalledWith(values[0]);
			await fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
			await fireEvent.click(screen.getByRole("option", { name: second, exact: true }));
			expect(callback).toHaveBeenLastCalledWith(values[1]);
			await fireEvent.click(screen.getByRole("button", { name: `Убрать: ${label}` }));
			expect(callback).toHaveBeenLastCalledWith(null);
		}
		await rerender({ editable: false });
		expect(screen.getByRole("article").getAttribute("aria-label")).toBe("Забытые святилища");
		expect(screen.getByText("/adventure/temples")).toBeTruthy();
		expect(screen.getByText("Древний культ")).toBeTruthy();
		expect(screen.getByRole("button", { name: "DMG", exact: true })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Святилища", exact: true })).toBeNull();
		expect(screen.getByText("В заметке нет ссылок на сущности плагина")).toBeTruthy();
	});

	it("keeps a reference on Escape, rejects arbitrary search text and supports keyboard selection", async () => {
		const onNoteChange = vi.fn();
		render(FullAdventure, { ...names, editable: true, notePath: "Тоннель.md", availableNotes: ["Тоннель.md", "Храм.md"], onNoteChange });
		const trigger = screen.getByRole("button", { name: "Заметка", exact: true });
		await fireEvent.click(trigger);
		await fireEvent.input(screen.getByRole("combobox", { name: "Поиск: Заметка" }), { target: { value: "Произвольная заметка" } });
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
		expect(onNoteChange).not.toHaveBeenCalled();
		expect(screen.getByText("Ничего не найдено")).toBeTruthy();
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
		expect(document.activeElement).toBe(trigger);
		expect(screen.getByRole("link", { name: "Тоннель.md" })).toBeTruthy();
		await fireEvent.keyDown(trigger, { key: "ArrowDown" });
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
		expect(onNoteChange).toHaveBeenLastCalledWith("Храм.md");
	});

	it("allows navigation in view mode and changes the graph only in edit mode", async () => {
		const onGraphChange = vi.fn();
		const onSceneSelect = vi.fn();
		const { rerender } = render(FullAdventure, { ...names, editable: false, availableSceneNotes: [{ path: "Тоннель.md", title: "Тоннель" }], onGraphChange, onSceneSelect, graphHeight: 300 });
		expect(screen.queryByRole("textbox")).toBeNull();
		expect(screen.queryByRole("button", { name: "Добавить сцену" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Удалить выделенное" })).toBeNull();
		for (const name of ["Увеличить масштаб", "Уменьшить масштаб", "Показать весь граф"]) expect(screen.getByRole("button", { name })).toBeTruthy();
		await rerender({ editable: true });
		await fireEvent.click(screen.getByRole("button", { name: "Добавить сцену" }));
		expect(screen.getByRole("combobox", { name: "Поиск: Добавить сцену" })).toBeTruthy();
		await rerender({ editable: false });
		expect(screen.queryByRole("combobox")).toBeNull();
		expect(onGraphChange).not.toHaveBeenCalled();
		await rerender({ editable: true });
		await fireEvent.click(screen.getByRole("button", { name: "Добавить сцену" }));
		await fireEvent.click(screen.getByRole("option", { name: "Тоннель — Тоннель.md" }));
		expect(onGraphChange).toHaveBeenCalledTimes(1);
		const added = onGraphChange.mock.calls[0][0];
		expect(added.nodes).toHaveLength(1);
		expect(added.nodes[0]).toMatchObject({ note: { path: "Тоннель.md" } });
		expect(added.links).toEqual([]);
		await rerender({ editable: false });
		const graph = screen.getByRole("application", { name: "Редактор сцен" });
		expect(graph.style.height).toBe("300px");
		expect(graph.querySelector(".svelte-flow__node")?.classList.contains("draggable")).toBe(false);
		expect(graph.querySelectorAll('.svelte-flow__handle[aria-hidden="true"]')).toHaveLength(4);
		await fireEvent.keyDown(graph, { key: "Delete" });
		await fireEvent.keyDown(graph, { key: "Backspace" });
		await fireEvent.keyDown(graph.querySelector(".svelte-flow__node")!, { key: "ArrowRight" });
		await fireEvent.keyUp(graph.querySelector(".svelte-flow__node")!, { key: "ArrowRight" });
		expect(onGraphChange).toHaveBeenCalledTimes(1);
		await rerender({ editable: true });
		await fireEvent.click(screen.getByRole("button", { name: "Удалить выделенное" }));
		expect(onGraphChange).toHaveBeenLastCalledWith({ nodes: [], links: [] });
	});

	it("shows empty pickers and refreshes only the adventure note's prepared content", async () => {
		const { unmount } = render(FullAdventure, { ...names, editable: true });
		await fireEvent.click(screen.getByRole("button", { name: "Плейлист", exact: true }));
		expect(screen.getByText("Нет доступных вариантов")).toBeTruthy();
		unmount();
		render(FullAdventurePreview, { ...names, editable: true, notePath: "Культ Вазрона/Дорога в Подземье.md", nodes: [], links: [] });
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		await fireEvent.click(screen.getByRole("button", { name: "Заметка", exact: true }));
		await fireEvent.click(screen.getByRole("option", { name: "Культ Вазрона/Забытые святилища.md" }));
		expect(screen.getAllByRole("listitem")).toHaveLength(1);
		expect(screen.getByRole("button", { name: "Открыть: Гроза свежевателей" })).toBeTruthy();
	});
	it("opens scene cards only in view mode and places creation immediately after the graph", async () => {
		const onSceneOpen = vi.fn(), onCreateScene = vi.fn();
		const nodes = [{ id: "a", note: { title: "Без заметки" }, position: { x: 0, y: 0 } }, { id: "b", note: { title: "Другая сцена" }, position: { x: 220, y: 0 } }];
		const { container, rerender } = render(FullAdventure, { ...names, nodes, onSceneOpen, onCreateScene });
		const graph = screen.getByRole("application", { name: "Редактор сцен" });
		expect(screen.queryByRole("button", { name: "Создать сцену" })).toBeNull();
		await fireEvent.click(container.querySelector('.svelte-flow__node[data-id="a"]')!);
		expect(onSceneOpen).toHaveBeenCalledWith("a");
		await rerender({ editable: true });
		const createButton = screen.getByRole("button", { name: "Создать сцену" }) as HTMLButtonElement;
		expect(graph.nextElementSibling).toBe(createButton);
		expect(createButton.disabled).toBe(false);
		await fireEvent.click(container.querySelector('.svelte-flow__node[data-id="b"]')!);
		expect(onSceneOpen).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("button", { name: "Добавить сцену", exact: true })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Создать сцену" }));
		expect(onCreateScene).toHaveBeenCalledOnce();
		await rerender({ editable: false });
		expect(screen.queryByRole("button", { name: "Создать сцену" })).toBeNull();
	});

});
