import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Playlist from "../../../design-system/src/lib/Playlist.svelte";

const names = { russianName: "Дорога в Подземье", entityLink: "/playlist/road_to_underdark" };
const tracks = [
	{ id: "tunnel", title: "Тоннель" },
	{ id: "spider", title: "Пещера", hasCombat: true },
	{ id: "temple", title: "Храм" },
];

describe("Playlist", () => {
	it("opens a track and displays its combat variant without editor controls", async () => {
		const onTrackClick = vi.fn();
		render(Playlist, { ...names, tracks, onTrackClick });
		await fireEvent.click(screen.getByRole("button", { name: "Открыть трек: Пещера" }));
		expect(onTrackClick).toHaveBeenCalledWith("spider");
		expect(screen.getByRole("img", { name: "Есть боевой вариант" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Добавить трек" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Удалить трек: Пещера" })).toBeNull();
	});

	it("reorders with keyboard and drag-and-drop and reports the resulting list", async () => {
		const onTracksChange = vi.fn();
		render(Playlist, { ...names, tracks, editable: true, onTracksChange });
		const handle = screen.getByRole("button", { name: "Изменить порядок: Тоннель" });
		await fireEvent.keyDown(handle, { key: "ArrowUp" });
		expect(onTracksChange).not.toHaveBeenCalled();
		await fireEvent.keyDown(handle, { key: "ArrowDown" });
		expect(onTracksChange.mock.lastCall?.[0].map((track: { id: string }) => track.id)).toEqual(["spider", "tunnel", "temple"]);
		expect(document.activeElement).toBe(handle);

		Object.assign(handle, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
		screen.getAllByRole("listitem").forEach((row, index) => {
			vi.spyOn(row, "getBoundingClientRect").mockReturnValue({ left: 0, right: 320, top: 60 + index * 46, bottom: 100 + index * 46, height: 40 } as DOMRect);
		});
		vi.spyOn(screen.getByRole("list"), "getBoundingClientRect").mockReturnValue({ left: 0, right: 320, top: 60, bottom: 192, height: 132 } as DOMRect);
		const down = Object.assign(new Event("pointerdown", { bubbles: true }), { pointerId: 1, button: 0, clientY: 126 });
		const move = Object.assign(new Event("pointermove", { bubbles: true }), { pointerId: 1, clientX: 48, clientY: 180 });
		const up = Object.assign(new Event("pointerup", { bubbles: true }), { pointerId: 1, clientX: 48, clientY: 180 });
		await fireEvent(handle, down);
		await fireEvent(handle, move);
		expect(screen.getByText("Позиция 3")).toBeTruthy();
		expect(screen.getByText("Отпустите здесь")).toBeTruthy();
		expect(onTracksChange).toHaveBeenCalledTimes(1);
		await fireEvent(handle, up);
		expect(onTracksChange.mock.lastCall?.[0].map((track: { id: string }) => track.id)).toEqual(["spider", "temple", "tunnel"]);
		expect(screen.getAllByRole("listitem")[2].textContent).toContain("Тоннель");
	});

	it("cancels a preview without changing the saved order", async () => {
		const onTracksChange = vi.fn();
		render(Playlist, { ...names, tracks, editable: true, onTracksChange });
		const handle = screen.getByRole("button", { name: "Изменить порядок: Тоннель" });
		Object.assign(handle, { setPointerCapture: vi.fn() });
		await fireEvent(handle, Object.assign(new Event("pointerdown", { bubbles: true }), { pointerId: 1, button: 0, clientY: 0 }));
		expect(screen.getByText("Отпустите здесь")).toBeTruthy();
		await fireEvent.keyDown(handle, { key: "Escape" });
		expect(screen.queryByText("Отпустите здесь")).toBeNull();
		expect(onTracksChange).not.toHaveBeenCalled();
		expect(screen.getAllByRole("listitem")[0].textContent).toContain("Тоннель");
	});

	it("removes the selected entry and requests adding a track in edit mode", async () => {
		const onAddTrack = vi.fn();
		const onTracksChange = vi.fn();
		render(Playlist, { ...names, tracks, editable: true, onAddTrack, onTracksChange });
		expect(screen.queryByLabelText("Английское название")).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Удалить трек: Пещера" }));
		expect(onTracksChange.mock.lastCall?.[0].map((track: { id: string }) => track.id)).toEqual(["tunnel", "temple"]);
		expect(screen.queryByRole("button", { name: "Открыть трек: Пещера" })).toBeNull();
		await fireEvent.click(screen.getByRole("button", { name: "Добавить трек" }));
		expect(onAddTrack).toHaveBeenCalledOnce();
	});
});
