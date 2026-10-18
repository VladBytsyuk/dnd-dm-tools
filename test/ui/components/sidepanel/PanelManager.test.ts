import { describe, expect, it, vi } from "vitest";
import { createDefaultAssistantWorkspace, type PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import { PanelManager } from "src/ui/components/sidepanel/PanelManager";
import type { PanelHost } from "src/ui/components/sidepanel/PanelHost";

vi.mock("obsidian", async () => ({ ...await import("../../../__mocks__/obsidian"), addIcon: vi.fn(), ItemView: class {} }));

async function setup() {
	const workspace = createDefaultAssistantWorkspace();
	workspace.tiles[0] = { tabs: ["bestiary", "classes", "initiative-tracker", "player"], activeTab: "classes" };
	const leaf = { setViewState: vi.fn() };
	const plugin = {
		registerView: vi.fn(), addRibbonIcon: vi.fn(),
		app: { workspace: { detachLeavesOfType: vi.fn(), getLeavesOfType: () => [leaf], revealLeaf: vi.fn() } },
	};
	const panels = new Map<PanelKey, PanelHost>();
	for (const key of ["classes", "bestiary", "initiative-tracker", "player", "character-sheets"] as const) {
		panels.set(key, {
			getKey: () => key, getTitle: () => key, getRibbonIconName: () => "book",
			mount: vi.fn(), search: vi.fn(async () => []), resolveItem: vi.fn(async () => null),
			...(key === "player" ? { openItem: vi.fn(async () => true) } : {}),
		});
	}
	const persist = vi.fn(async () => {});
	const manager = new PanelManager(plugin as never, () => workspace, persist);
	await manager.register([...panels.values()], false);
	return { manager, workspace, panels, persist };
}

describe("Assistant navigation with the permanent design", () => {
	it("keeps tracker first, hides classes and preserves character sheets", async () => {
		const { manager, workspace, panels } = await setup();
		const keys = manager.getPanelSummaries().map((panel) => panel.key);
		expect(keys[0]).toBe("initiative-tracker");
		expect(keys).not.toContain("classes");
		expect(keys).toContain("character-sheets");
		expect(manager.getVisibleWorkspace().tiles[0]).toEqual({ tabs: ["initiative-tracker", "bestiary", "player"], activeTab: "initiative-tracker" });
		expect(workspace.tiles[0].tabs).toContain("classes");
		await manager.search("существо");
		expect(panels.get("classes")!.search).not.toHaveBeenCalled();
		expect(panels.get("character-sheets")!.search).toHaveBeenCalled();
		expect(await manager.resolveEntity("/classes/fighter")).toBeNull();
	});

	it("uses media panel navigation and respects cancelled navigation", async () => {
		const { manager, panels, persist } = await setup();
		const item = { name: { rus: "Музыка", eng: "Music" }, url: "/track/music" };
		await manager.openItem("player", item);
		expect(panels.get("player")!.openItem).toHaveBeenCalledWith(item);
		expect(persist).toHaveBeenCalledOnce();
		vi.mocked(panels.get("player")!.openItem!).mockResolvedValue(false);
		await manager.openItem("player", item);
		expect(persist).toHaveBeenCalledOnce();
	});
});
