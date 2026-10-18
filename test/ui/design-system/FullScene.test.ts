import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import FullScene, { type FullSceneEntity } from "../../../design-system/src/lib/FullScene.svelte";
import FullScenePreview from "../../../design-system/src/lib/FullScenePreview.svelte";

const names = { russianName: "Дорога в Подземье", entityLink: "/scene/underdark" };
const card = createRawSnippet<["dark" | "light"]>((theme) => ({ render: () => `<div>Карточка ${theme()}</div>` }));
const entities: FullSceneEntity[] = [
	{ url: "/bestiary/ogremoch", label: "Огремох", card },
	{ url: "/bestiary/ogremoch", label: "Повтор Огремоха", card },
	{ url: "/items/bolts", label: "Арбалетные болты", card },
];

describe("FullScene", () => {
	it("deduplicates by URL in first-appearance order and passes the theme to card snippets", () => {
		render(FullScene, { ...names, entities, theme: "light", onEntityClick: vi.fn() });
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getAllByRole("button", { name: /^Открыть:/ }).map((button) => button.getAttribute("aria-label"))).toEqual(["Открыть: Огремох", "Открыть: Арбалетные болты"]);
		expect(screen.getAllByText("Карточка light")).toHaveLength(2);
	});

	it("routes opening a note, a track and entity cards separately", async () => {
		const onOpenNote = vi.fn();
		const onTrackClick = vi.fn();
		const onEntityClick = vi.fn();
		render(FullScene, { ...names, notePath: "Культ/Подземье.md", track: { id: "music", title: "Подземье" }, entities, onOpenNote, onTrackClick, onEntityClick });
		await fireEvent.click(screen.getByRole("link", { name: "Культ/Подземье.md" }));
		expect(onOpenNote).toHaveBeenCalledWith("Культ/Подземье.md");
		await fireEvent.click(screen.getByRole("button", { name: "Подземье" }));
		expect(onTrackClick).toHaveBeenCalledWith("music");
		await fireEvent.keyDown(screen.getByRole("button", { name: "Открыть: Огремох" }), { key: "Enter" });
		await fireEvent.keyDown(screen.getByRole("button", { name: "Открыть: Арбалетные болты" }), { key: " " });
		expect(onEntityClick.mock.calls).toEqual([["/bestiary/ogremoch"], ["/items/bolts"]]);
	});

	it("edits the name and URL and selects, replaces and removes each reference", async () => {
		const onAdventureChange = vi.fn();
		const onNoteChange = vi.fn();
		const onTrackChange = vi.fn();
		const adventures = [{ id: "a", title: "Культ Вазрона" }, { id: "b", title: "Дорога в Шамат" }];
		const tracks = [{ id: "t", title: "Подземье" }, { id: "s", title: "Храм" }];
		const { rerender } = render(FullScene, { ...names, editable: true, availableAdventures: adventures, availableNotes: ["Тоннель.md", "Храм.md"], availableTracks: tracks, onAdventureChange, onNoteChange, onTrackChange });
		expect(screen.queryByLabelText("Английское название")).toBeNull();
		expect(screen.queryByLabelText("Описание")).toBeNull();
		await fireEvent.input(screen.getByLabelText("Русское название"), { target: { value: "Забытый храм" } });
		await fireEvent.input(screen.getByLabelText("Ссылка на сущность"), { target: { value: "/scene/temple" } });
		for (const [label, first, second, callback, values] of [
			["Приключение", "Культ Вазрона", "Дорога в Шамат", onAdventureChange, adventures],
			["Заметка", "Тоннель.md", "Храм.md", onNoteChange, ["Тоннель.md", "Храм.md"]],
			["Трек", "Подземье", "Храм", onTrackChange, tracks],
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
		expect(screen.getByRole("article").getAttribute("aria-label")).toBe("Забытый храм");
		expect(screen.getByText("/scene/temple")).toBeTruthy();
		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByText("В заметке нет ссылок на сущности плагина")).toBeTruthy();
	});

	it("demonstrates replacing a note and its externally prepared content", async () => {
		render(FullScenePreview, { ...names, editable: true, notePath: "Культ Вазрона/Дорога в Подземье.md" });
		expect(screen.getAllByRole("listitem")).toHaveLength(4);
		await fireEvent.click(screen.getByRole("button", { name: "Заметка", exact: true }));
		await fireEvent.click(screen.getByRole("option", { name: "Культ Вазрона/Забытый храм.md" }));
		expect(screen.getAllByRole("listitem")).toHaveLength(1);
		expect(screen.getByRole("button", { name: "Открыть: Гроза свежевателей" })).toBeTruthy();
	});
});
