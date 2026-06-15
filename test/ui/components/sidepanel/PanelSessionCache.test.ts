import { describe, expect, it, vi } from "vitest";
import { PanelSessionCache } from "src/ui/components/sidepanel/PanelSessionCache";

describe("PanelSessionCache", () => {
	it("reattaches the same mounted panel without losing DOM state", async () => {
		const component = {};
		const mountComponent = vi.fn(async (_key, element: Element) => {
			const input = document.createElement("input");
			element.appendChild(input);
			return component;
		});
		const unmountComponent = vi.fn();
		const cache = new PanelSessionCache(mountComponent, unmountComponent);
		const firstTarget = document.createElement("div");
		const secondTarget = document.createElement("div");

		const detachFirst = await cache.attach("spellbook", firstTarget);
		const input = firstTarget.querySelector("input")!;
		input.value = "fireball";

		const detachSecond = await cache.attach("spellbook", secondTarget);
		detachFirst();

		expect(mountComponent).toHaveBeenCalledOnce();
		expect(secondTarget.querySelector("input")).toBe(input);
		expect(input.value).toBe("fireball");
		expect(unmountComponent).not.toHaveBeenCalled();

		detachSecond();
		expect(secondTarget.childElementCount).toBe(0);
	});

	it("discards a closed panel and mounts a fresh instance next time", async () => {
		const components = [{}, {}];
		const mountComponent = vi.fn()
			.mockResolvedValueOnce(components[0])
			.mockResolvedValueOnce(components[1]);
		const unmountComponent = vi.fn();
		const cache = new PanelSessionCache(mountComponent, unmountComponent);
		const target = document.createElement("div");

		await cache.attach("bestiary", target);
		cache.discard("bestiary");
		await cache.attach("bestiary", target);

		expect(mountComponent).toHaveBeenCalledTimes(2);
		expect(unmountComponent).toHaveBeenCalledOnce();
		expect(unmountComponent).toHaveBeenCalledWith(components[0]);
	});

	it("runs detach cleanup without unmounting the panel", async () => {
		const component = {};
		const mountComponent = vi.fn().mockResolvedValue(component);
		const unmountComponent = vi.fn();
		const onDetach = vi.fn();
		const cache = new PanelSessionCache(
			mountComponent,
			unmountComponent,
			onDetach,
		);
		const target = document.createElement("div");

		const detach = await cache.attach("initiative-tracker", target);
		detach();
		await cache.attach("initiative-tracker", target);

		expect(onDetach).toHaveBeenCalledOnce();
		expect(onDetach).toHaveBeenCalledWith("initiative-tracker");
		expect(unmountComponent).not.toHaveBeenCalled();
		expect(mountComponent).toHaveBeenCalledOnce();
	});

	it("does not run stale detach cleanup after the panel was reattached elsewhere", async () => {
		const component = {};
		const onDetach = vi.fn();
		const cache = new PanelSessionCache(
			vi.fn().mockResolvedValue(component),
			vi.fn(),
			onDetach,
		);
		const firstTarget = document.createElement("div");
		const secondTarget = document.createElement("div");

		const detachFirst = await cache.attach("initiative-tracker", firstTarget);
		await cache.attach("initiative-tracker", secondTarget);
		detachFirst();

		expect(secondTarget.querySelector(".omni-panel-session")).not.toBeNull();
		expect(onDetach).not.toHaveBeenCalled();
	});

	it("unmounts a panel that finishes mounting after it was discarded", async () => {
		let resolveMount: (component: unknown) => void = () => {};
		const component = {};
		const mountComponent = vi.fn(() => new Promise<unknown>((resolve) => {
			resolveMount = resolve;
		}));
		const unmountComponent = vi.fn();
		const cache = new PanelSessionCache(mountComponent, unmountComponent);
		const target = document.createElement("div");

		const attachment = cache.attach("dm-screen", target);
		cache.discard("dm-screen");
		resolveMount(component);
		await attachment;

		expect(target.childElementCount).toBe(0);
		expect(unmountComponent).toHaveBeenCalledWith(component);
	});

	it("disposes every mounted panel", async () => {
		const components = [{}, {}];
		const mountComponent = vi.fn()
			.mockResolvedValueOnce(components[0])
			.mockResolvedValueOnce(components[1]);
		const unmountComponent = vi.fn();
		const cache = new PanelSessionCache(mountComponent, unmountComponent);

		await cache.attach("spellbook", document.createElement("div"));
		await cache.attach("bestiary", document.createElement("div"));
		cache.dispose();

		expect(unmountComponent).toHaveBeenCalledTimes(2);
		expect(unmountComponent).toHaveBeenCalledWith(components[0]);
		expect(unmountComponent).toHaveBeenCalledWith(components[1]);
	});
});
