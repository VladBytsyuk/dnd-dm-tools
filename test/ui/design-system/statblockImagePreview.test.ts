import { act, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "obsidian";
import RedesignedFullItem from "src/ui/design-system/RedesignedFullItem.svelte";
import { UiEventListener } from "src/data/ui_event_listener";
import { EmptyFullMonster } from "src/domain/models/monster/FullMonster";

function setup(initiallyEnabled: boolean) {
	let enabled = initiallyEnabled;
	const listeners = new Set<() => void>();
	const send = vi.fn(async () => {});
	const listener = new UiEventListener(
		new App(), () => null!, () => null!, () => null!, () => null!, () => null!, () => null!,
		() => null!, () => null!, () => null!, () => null!, () => null, () => null!, send,
		() => enabled,
		(callback) => { listeners.add(callback); return () => { listeners.delete(callback); }; },
	);
	vi.spyOn(listener, "onImageRequested").mockResolvedValue("data:image/png;base64,aW1hZ2U=");
	const monster = { ...EmptyFullMonster(), name: { rus: "Монстр", eng: "Monster" }, url: "/bestiary/monster", images: ["Images/monster.png"] };
	const view = render(RedesignedFullItem, { panelKey: "bestiary", currentItem: monster, uiEventListener: listener });
	return { view, send, listeners, setEnabled: (value: boolean) => { enabled = value; listeners.forEach((callback) => callback()); } };
}

describe("statblock image preview Owlbear action", () => {
	beforeEach(() => { (HTMLElement.prototype as any).empty = function () { this.replaceChildren(); }; });
	afterEach(() => { delete (HTMLElement.prototype as any).empty; });
	it.each([false, true])("shows the send button only when the integration is enabled (%s)", async (enabled) => {
		const test = setup(enabled);
		await fireEvent.load(await screen.findByRole("img", { name: "Монстр" }));
		await fireEvent.click(await screen.findByRole("button", { name: "Развернуть изображение" }));
		expect(screen.getByRole("dialog", { name: "Просмотр изображения" })).toBeTruthy();
		if (enabled) {
			await fireEvent.click(screen.getByRole("button", { name: "Отправить в Owlbear" }));
			await waitFor(() => expect(test.send).toHaveBeenCalledWith("Images/monster.png", "Монстр"));
		} else {
			expect(screen.queryByRole("button", { name: "Отправить в Owlbear" })).toBeNull();
			expect(test.send).not.toHaveBeenCalled();
		}
	});
	it("updates an open image preview when the integration changes and unsubscribes on unmount", async () => {
		const test = setup(false);
		await fireEvent.load(await screen.findByRole("img", { name: "Монстр" }));
		await fireEvent.click(await screen.findByRole("button", { name: "Развернуть изображение" }));
		await act(() => test.setEnabled(true));
		expect(screen.getByRole("button", { name: "Отправить в Owlbear" })).toBeTruthy();
		await act(() => test.setEnabled(false));
		expect(screen.queryByRole("button", { name: "Отправить в Owlbear" })).toBeNull();
		expect(screen.getByRole("dialog", { name: "Просмотр изображения" })).toBeTruthy();
		const close = screen.getByRole("button", { name: "Закрыть изображение" });
		close.focus();
		await fireEvent.keyDown(window, { key: "Tab" });
		expect(document.activeElement).toBe(close);
		expect(test.listeners.size).toBe(1);
		test.view.unmount();
		expect(test.listeners.size).toBe(0);
	});
});
