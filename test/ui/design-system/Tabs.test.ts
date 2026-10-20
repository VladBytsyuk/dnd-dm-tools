import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Tabs from "../../../design-system/src/lib/Tabs.svelte";

const items = [{ value: "adventure", label: "Приключения" }, { value: "scene", label: "Сцены" }];

describe("Tabs", () => {
	it("connects tabs to the content panel, selects on click and responds to external changes", async () => {
		const onValueChange = vi.fn();
		const { rerender } = render(Tabs, { id: "library", panelId: "content", ariaLabel: "Приключения и сцены", items, value: "adventure", onValueChange });
		expect(screen.getByRole("tablist", { name: "Приключения и сцены" })).toBeTruthy();
		const adventure = screen.getByRole("tab", { name: "Приключения" }), scene = screen.getByRole("tab", { name: "Сцены" });
		expect(adventure.id).toBe("library-adventure");
		expect(adventure.getAttribute("aria-controls")).toBe("content");
		expect(adventure.getAttribute("aria-selected")).toBe("true");
		expect(adventure.tabIndex).toBe(0);
		expect(scene.tabIndex).toBe(-1);
		await fireEvent.click(scene);
		expect(scene.getAttribute("aria-selected")).toBe("true");
		expect(onValueChange).toHaveBeenCalledOnce();
		expect(onValueChange).toHaveBeenLastCalledWith("scene");
		await fireEvent.click(scene);
		expect(onValueChange).toHaveBeenCalledOnce();
		await rerender({ value: "adventure", theme: "light" });
		expect(adventure.getAttribute("aria-selected")).toBe("true");
		expect(screen.getByRole("tablist").getAttribute("data-theme")).toBe("light");
	});
	it("wraps keyboard navigation, skips disabled tabs and moves focus with the selection", async () => {
		const onValueChange = vi.fn();
		render(Tabs, { items: [...items.slice(0, 1), { value: "locked", label: "Недоступно", disabled: true }, items[1]], onValueChange });
		const adventure = screen.getByRole("tab", { name: "Приключения" }), scene = screen.getByRole("tab", { name: "Сцены" });
		await fireEvent.keyDown(adventure, { key: "ArrowRight" });
		expect(document.activeElement).toBe(scene);
		expect(scene.getAttribute("aria-selected")).toBe("true");
		await fireEvent.keyDown(scene, { key: "ArrowRight" });
		expect(document.activeElement).toBe(adventure);
		await fireEvent.keyDown(adventure, { key: "ArrowLeft" });
		expect(document.activeElement).toBe(scene);
		await fireEvent.keyDown(scene, { key: "Home" });
		expect(document.activeElement).toBe(adventure);
		await fireEvent.keyDown(adventure, { key: "End" });
		expect(document.activeElement).toBe(scene);
		expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(["scene", "adventure", "scene", "adventure", "scene"]);
		expect((screen.getByRole("tab", { name: "Недоступно" }) as HTMLButtonElement).disabled).toBe(true);
	});
	it("keeps a usable tab stop when the selected item disappears and handles empty lists", async () => {
		const { rerender } = render(Tabs, { items, value: "scene" });
		await rerender({ items: [items[0]] });
		expect(screen.getByRole("tab").tabIndex).toBe(0);
		expect(screen.getByRole("tab").getAttribute("aria-selected")).toBe("true");
		await rerender({ items: [{ ...items[0], disabled: true }] });
		expect(screen.getByRole("tab").tabIndex).toBe(-1);
		await rerender({ items: [] });
		expect(screen.queryByRole("tab")).toBeNull();
	});
	it("generates separate IDs for multiple instances", () => {
		const first = render(Tabs, { items }), second = render(Tabs, { items });
		const ids = [...first.container.querySelectorAll('[role="tab"]'), ...second.container.querySelectorAll('[role="tab"]')].map((tab) => tab.id);
		expect(new Set(ids).size).toBe(4);
	});
});
