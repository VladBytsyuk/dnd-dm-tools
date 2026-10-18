import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import UiItemGroup from "src/ui/layout/uikit/organisms/UiItemGroup.svelte";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("shared list group shell", () => {
	it("keeps Add independent from expanding the group and reports open changes", async () => {
		const onAdd = vi.fn(), onOpenChange = vi.fn();
		const view = render(UiItemGroup, { panelKey: "spellbook", groupTitle: "Заклинания", items: [], onItemClick: vi.fn(), onAdd, onOpenChange });
		const details = view.container.querySelector("details")!;
		await fireEvent.click(screen.getByRole("button", { name: "Добавить: Заклинания" }));
		expect(onAdd).toHaveBeenCalledOnce();
		expect(details.open).toBe(true);
		expect(onOpenChange).not.toHaveBeenCalled();
		await fireEvent.click(view.container.querySelector("summary")!);
		expect(details.open).toBe(false);
		expect(onOpenChange).toHaveBeenLastCalledWith(false);
		await fireEvent.click(view.container.querySelector("summary")!);
		expect(details.open).toBe(true);
		expect(onOpenChange).toHaveBeenLastCalledWith(true);
	});

	it("observes pagination only while expanded and disconnects when collapsed", async () => {
		const disconnect = vi.fn(), observe = vi.fn(), onLoadMore = vi.fn();
		let intersect: IntersectionObserverCallback;
		vi.stubGlobal("IntersectionObserver", class {
			constructor(callback: IntersectionObserverCallback) { intersect = callback; }
			observe = observe;
			disconnect = disconnect;
		});
		const view = render(UiItemGroup, { panelKey: "spellbook", groupTitle: "Заклинания", items: [], onItemClick: vi.fn(), showLoadMore: true, onLoadMore });
		expect(observe).toHaveBeenCalledOnce();
		intersect!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
		expect(onLoadMore).toHaveBeenCalledOnce();
		await fireEvent.click(view.container.querySelector("summary")!);
		expect(disconnect).toHaveBeenCalledOnce();
		await fireEvent.click(view.container.querySelector("summary")!);
		expect(observe).toHaveBeenCalledTimes(2);
	});
});
