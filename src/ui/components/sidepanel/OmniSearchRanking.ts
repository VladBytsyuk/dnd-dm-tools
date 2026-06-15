import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { PanelSearchResult } from "./PanelHost";

type MatchScore = [category: number, position: number, unmatchedLength: number];

function getMatchScore(name: string, query: string): MatchScore {
	const normalizedName = name.trim().toLocaleLowerCase("ru-RU");
	const position = normalizedName.indexOf(query);

	if (position < 0) return [3, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
	if (normalizedName === query) return [0, 0, 0];
	if (position === 0) return [1, 0, normalizedName.length - query.length];
	return [2, position, normalizedName.length - query.length];
}

function compareScores(left: MatchScore, right: MatchScore): number {
	for (let index = 0; index < left.length; index++) {
		const difference = left[index] - right[index];
		if (difference !== 0) return difference;
	}
	return 0;
}

function getItemScore(item: BaseItem, query: string): MatchScore {
	const rusScore = getMatchScore(item.name.rus, query);
	const engScore = getMatchScore(item.name.eng, query);
	return compareScores(rusScore, engScore) <= 0 ? rusScore : engScore;
}

function sortBySearchRelevance<T>(
	items: readonly T[],
	query: string,
	getItem: (value: T) => BaseItem,
): T[] {
	const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
	if (!normalizedQuery) return [...items];

	return items
		.map((item, index) => ({
			item,
			index,
			score: getItemScore(getItem(item), normalizedQuery),
		}))
		.sort((left, right) =>
			compareScores(left.score, right.score) || left.index - right.index
		)
		.map(({ item }) => item);
}

export function sortItemsBySearchRelevance<T extends BaseItem>(
	items: readonly T[],
	query: string,
): T[] {
	return sortBySearchRelevance(items, query, (item) => item);
}

export function sortPanelResultsBySearchRelevance(
	results: readonly PanelSearchResult[],
	query: string,
): PanelSearchResult[] {
	return sortBySearchRelevance(results, query, (result) => result.item);
}
