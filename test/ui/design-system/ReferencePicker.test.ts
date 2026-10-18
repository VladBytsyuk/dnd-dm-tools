import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ReferencePicker from "../../../design-system/src/lib/ReferencePicker.svelte";

const options = [{ value: "cult", label: "Культ Вазрона" }, { value: "shamat", label: "Дорога в Шамат" }];

describe("ReferencePicker", () => {
	it("opens a controlled panel without a trigger and reports closing without changing the value", async () => {
		const onChange = vi.fn();
		const onClose = vi.fn();
		render(ReferencePicker, { label: "Следующая заметка", options, open: true, panelOnly: true, onChange, onClose });
		expect(screen.queryByRole("button", { name: "Следующая заметка" })).toBeNull();
		expect(screen.getByRole("combobox")).toBeTruthy();
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
		expect(onClose).toHaveBeenCalledOnce();
		expect(onChange).not.toHaveBeenCalled();
		expect(screen.queryByRole("listbox")).toBeNull();
	});
	it("filters existing references and reports selecting and clearing a value", async () => {
		const onChange = vi.fn();
		render(ReferencePicker, { label: "Приключение", options, onChange });
		await fireEvent.click(screen.getByRole("button", { name: "Приключение" }));
		await fireEvent.input(screen.getByRole("combobox"), { target: { value: "ШАМАТ" } });
		expect(screen.getAllByRole("option")).toHaveLength(1);
		await fireEvent.click(screen.getByRole("option", { name: "Дорога в Шамат" }));
		expect(onChange).toHaveBeenLastCalledWith("shamat");
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(screen.getByRole("button", { name: "Приключение" }).textContent).toContain("Дорога в Шамат");
		await fireEvent.click(screen.getByRole("button", { name: "Убрать: Приключение" }));
		expect(onChange).toHaveBeenLastCalledWith(null);
	});

	it("navigates with the keyboard, cancels without changing selection and restores focus", async () => {
		const onChange = vi.fn();
		render(ReferencePicker, { label: "Приключение", options, onChange });
		const trigger = screen.getByRole("button", { name: "Приключение" });
		await fireEvent.keyDown(trigger, { key: "ArrowDown" });
		const search = screen.getByRole("combobox");
		expect(document.activeElement).toBe(search);
		await fireEvent.keyDown(search, { key: "ArrowDown" });
		await fireEvent.keyDown(search, { key: "Enter" });
		expect(onChange).toHaveBeenLastCalledWith("shamat");
		expect(document.activeElement).toBe(trigger);
		await fireEvent.click(trigger);
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Home" });
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
		expect(onChange).toHaveBeenCalledOnce();
		expect(document.activeElement).toBe(trigger);
		expect(trigger.textContent).toContain("Дорога в Шамат");
		await fireEvent.click(trigger);
		await fireEvent.pointerDown(document.body);
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it("cannot save a search string and distinguishes empty options from no matches", async () => {
		const onChange = vi.fn();
		const { rerender } = render(ReferencePicker, { label: "Приключение", options, value: "cult", onChange });
		await fireEvent.click(screen.getByRole("button", { name: "Приключение" }));
		await fireEvent.input(screen.getByRole("combobox"), { target: { value: "Несуществующее приключение" } });
		expect(screen.getByRole("status").textContent).toBe("Ничего не найдено");
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
		expect(onChange).not.toHaveBeenCalled();
		await fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
		expect(screen.getByRole("button", { name: "Приключение" }).textContent).toContain("Культ Вазрона");
		await rerender({ options: [], selectedLabel: "Культ Вазрона" });
		await fireEvent.click(screen.getByRole("button", { name: "Приключение" }));
		expect(screen.getByRole("status").textContent).toBe("Нет доступных вариантов");
		expect(onChange).not.toHaveBeenCalled();
	});
});
