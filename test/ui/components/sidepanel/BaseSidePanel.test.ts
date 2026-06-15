import { describe, expect, it, vi } from "vitest";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import { BaseSidePanel } from "src/ui/components/sidepanel/BaseSidePanel";

class TestSidePanel extends BaseSidePanel<BaseItem, BaseItem, Record<string, never>> {
	getKey(): PanelKey {
		return "spellbook";
	}

	getRibbonIconName(): string {
		return "book";
	}

	getTitle(): string {
		return "Test";
	}

	async mountSvelteComponent(): Promise<unknown> {
		return undefined;
	}
}

describe("BaseSidePanel search", () => {
	it("ranks results before applying the per-panel limit", async () => {
		const weakMatches = Array.from({ length: 25 }, (_, index) => ({
			name: {
				rus: `Заклинание ${index} огненный шар`,
				eng: `Spell ${index} Fireball`,
			},
			url: `/weak-${index}`,
		}));
		const exactMatch = {
			name: { rus: "Огненный шар", eng: "Fireball" },
			url: "/exact",
		};
		const repository = {
			getFilteredSmallItems: vi.fn().mockResolvedValue([
				...weakMatches,
				exactMatch,
			]),
		};
		const panel = new TestSidePanel(
			{} as never,
			repository as never,
			{} as never,
		);

		const results = await panel.search("fireball");

		expect(results).toHaveLength(25);
		expect(results[0].url).toBe("/exact");
	});
});
