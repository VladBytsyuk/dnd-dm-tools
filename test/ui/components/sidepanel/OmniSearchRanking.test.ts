import { describe, expect, it } from "vitest";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
import {
	sortItemsBySearchRelevance,
	sortPanelResultsBySearchRelevance,
} from "src/ui/components/sidepanel/OmniSearchRanking";

function item(rus: string, eng = rus): BaseItem {
	return {
		name: { rus, eng },
		url: `/${eng.toLocaleLowerCase("ru-RU").replaceAll(" ", "-")}`,
	};
}

describe("sortBySearchRelevance", () => {
	it("orders exact, prefix, and substring matches by relevance", () => {
		const results = sortItemsBySearchRelevance([
			item("Greater Fireball"),
			item("Wild Fireball"),
			item("Fireball Storm"),
			item("Fireball"),
		], "fireball");

		expect(results.map((result) => result.name.eng)).toEqual([
			"Fireball",
			"Fireball Storm",
			"Wild Fireball",
			"Greater Fireball",
		]);
	});

	it("uses the better match from Russian and English names", () => {
		const exactEnglish = item("Огненный шар", "Fireball");
		const russianSubstring = item("Великий огненный шар", "Greater Flame Orb");

		expect(sortItemsBySearchRelevance(
			[russianSubstring, exactEnglish],
			" FIREBALL ",
		)).toEqual([exactEnglish, russianSubstring]);
	});

	it("mixes content types by relevance and preserves ties", () => {
		const result = (
			panelKey: PanelSearchResult["panelKey"],
			searchItem: BaseItem,
		): PanelSearchResult => ({
			panelKey,
			url: searchItem.url,
			title: searchItem.name.rus,
			subtitle: searchItem.name.eng,
			item: searchItem,
		});
		const monsterSubstring = result("bestiary", item("Fireball Monster"));
		const spellExact = result("spellbook", item("Fireball"));
		const equipmentPrefix = result("equipment", item("Fireball Wand"));
		const firstTie = result("arsenal", item("Wild Fireball"));
		const secondTie = result("armory", item("Cold Fireball"));

		expect(sortPanelResultsBySearchRelevance([
			monsterSubstring,
			firstTie,
			spellExact,
			secondTie,
			equipmentPrefix,
		], "fireball")).toEqual([
			spellExact,
			equipmentPrefix,
			monsterSubstring,
			firstTie,
			secondTie,
		]);
	});
});
