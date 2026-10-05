import { describe, expect, it, vi } from "vitest";
import { BaseSidePanel } from "src/ui/components/sidepanel/BaseSidePanel";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Filters } from "src/domain/models/common/Filters";

class SearchPanel extends BaseSidePanel<BaseItem, BaseItem, Filters> {
	getKey() { return "spellbook" as const; }
	getRibbonIconName() { return "book"; }
	getTitle() { return "Заклинания"; }
	async mountSvelteComponent() { return undefined; }
}

describe("omni search favorites", () => {
	it("includes a matching favorite beyond the normal per-panel limit", async () => {
		const items = Array.from({ length: 30 }, (_, index): BaseItem => ({
			name: { rus: `Заклинание ${index}`, eng: `Spell ${index}` },
			url: `/spells/${index}`,
		}));
		const repository = {
			getFilteredSmallItems: vi.fn().mockResolvedValue(items),
			favorites: { listUrls: vi.fn().mockReturnValue([items[29].url]) },
		};
		const panel = new SearchPanel({} as any, repository as any, {} as any);

		const results = await panel.search("spell");

		expect(results).toHaveLength(26);
		expect(results.at(-1)).toMatchObject({ url: items[29].url, favorite: true });
		expect(results.some((result) => result.url === items[28].url)).toBe(false);
		expect(results[0].favorite).toBe(false);
		expect(repository.favorites.listUrls).toHaveBeenCalledWith("spellbook");
	});
});
