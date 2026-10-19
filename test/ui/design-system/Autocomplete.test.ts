import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Autocomplete from "../../../design-system/src/lib/Autocomplete.svelte";

const options = [{ value: "cult", label: "Культ Вазрона" }, { value: "road", label: "Дорога в Шамат" }];

describe("Autocomplete", () => {
	it("filters without case sensitivity, selects with the keyboard and keeps focus in the input", async () => {
		const onSelect = vi.fn(), onValueChange = vi.fn();
		render(Autocomplete, { label: "Приключения", options, onSelect, onValueChange });
		const input = screen.getByRole("combobox", { name: "Приключения" });
		input.focus();
		await fireEvent.input(input, { target: { value: "ШАМ" } });
		expect(screen.getAllByRole("option")).toHaveLength(1);
		expect(onValueChange).toHaveBeenLastCalledWith("ШАМ");
		await fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent).toBe("Дорога в Шамат");
		await fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith(options[1]);
		expect((input as HTMLInputElement).value).toBe("Дорога в Шамат");
		expect(onValueChange).toHaveBeenLastCalledWith("Дорога в Шамат");
		expect(input.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(input);
	});
	it("allows new text and clearing without choosing an existing option", async () => {
		const onSelect = vi.fn(), onValueChange = vi.fn();
		render(Autocomplete, { label: "Кампания", options, onSelect, onValueChange });
		const input = screen.getByRole("combobox");
		await fireEvent.input(input, { target: { value: "Новая кампания" } });
		expect(screen.getByRole("status").textContent).toBe("Нет подсказок");
		await fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).not.toHaveBeenCalled();
		expect((input as HTMLInputElement).value).toBe("Новая кампания");
		await fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByRole("listbox")).toBeNull();
		await fireEvent.input(input, { target: { value: "" } });
		expect(onValueChange).toHaveBeenLastCalledWith("");
		expect(screen.getAllByRole("option")).toHaveLength(2);
	});
	it("selects by pointer, follows changed options and closes when focus leaves", async () => {
		const onSelect = vi.fn();
		const { rerender } = render(Autocomplete, { label: "Кампания", options, onSelect });
		const input = screen.getByRole("combobox");
		await fireEvent.focus(input);
		await fireEvent.keyDown(input, { key: "ArrowUp" });
		await rerender({ options: [options[0]] });
		expect(input.hasAttribute("aria-activedescendant")).toBe(false);
		await fireEvent.click(screen.getByRole("option", { name: "Культ Вазрона" }));
		expect(onSelect).toHaveBeenCalledWith(options[0]);
		await fireEvent.focus(input);
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(screen.queryByRole("listbox")).toBeNull();
		await fireEvent.focus(input);
		await fireEvent.pointerDown(document.body);
		expect(screen.queryByRole("listbox")).toBeNull();
	});
});
