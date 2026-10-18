import { describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { MediaNavigation } from "src/ui/layout/media/MediaNavigation";
describe("media history", () => {
	it("keeps playlist and track navigation and cancels leaving without changing the stack", async () => {
		const nav = new MediaNavigation();
		await nav.open({ kind: "playlist", id: "list" });
		await nav.open({ kind: "track", id: "track" });
		nav.beforeLeave = vi.fn(async () => false);
		await nav.back(); expect(get(nav.routes)).toHaveLength(2);
		expect(await nav.open({ kind: "track", id: "another" })).toBe(false);
		nav.beforeLeave = async () => true;
		await nav.back(); expect(get(nav.routes)).toEqual([{ kind: "playlist", id: "list" }]);
		await nav.open({ kind: "playlist", id: "list" }); expect(get(nav.routes)).toHaveLength(1);
		await nav.back(); expect(get(nav.routes)).toEqual([]);
	});
	it("does not pop the previous screen when the leave guard removes an unsaved route", async () => {
		const nav = new MediaNavigation();
		await nav.open({ kind: "adventure", id: "quest" });
		await nav.open({ kind: "scene", id: "draft" });
		nav.beforeLeave = async () => { nav.routes.update((routes) => routes.slice(0, -1)); return true; };
		await nav.back();
		expect(get(nav.routes)).toEqual([{ kind: "adventure", id: "quest" }]);
	});
});
