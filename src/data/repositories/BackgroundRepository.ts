import { BackgroundMapper } from "src/data/mappers/sourceMappers";
import type { FullItemReadService, ServiceResult } from "src/data/ports";
import { smallItemProjectors } from "src/data/projectors/smallItemProjectors";
import type { TtgItemWithHtml } from "src/data/services";
import { TtgService } from "src/data/services";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { type BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import { createFilters } from "src/domain/models/common/Filters";
import { sortSources } from "src/domain/utils/SourceSorter";
import type { Backgrounds } from "src/domain/repositories/Backgrounds";
import type { Group } from "src/domain/repositories/Repository";
import type { Dao } from "src/domain/Dao";
import {
	createSimpleRepositoryDependencies,
	SimpleRepository,
	type SimpleRepositoryDatabase,
	type SimpleRepositoryDependencies,
} from "./SimpleRepository";

type BackgroundWithHtmlResponse = TtgItemWithHtml<Record<string, unknown>>;

type BackgroundRepositoryDatabase = SimpleRepositoryDatabase & {
	smallBackgroundDao: Dao<SmallBackground, BackgroundsFilters>;
	fullBackgroundDao: Dao<FullBackground, unknown>;
};

class BackgroundWithHtmlService implements FullItemReadService<BackgroundWithHtmlResponse> {
	constructor(private readonly service = new TtgService()) {}

	async getFullItem(url: string): Promise<ServiceResult<BackgroundWithHtmlResponse>> {
		return await this.service.getBackgroundWithHtml(url);
	}
}

class BackgroundWithHtmlMapper extends BackgroundMapper {
	override map(response: BackgroundWithHtmlResponse, url: string): FullBackground {
		return super.map({
			...response.item,
			associatedUrl: response.associatedUrl,
			associatedHtml: response.associatedHtml,
		}, url);
	}
}

export class BackgroundRepository
	extends SimpleRepository<
		SmallBackground,
		FullBackground,
		BackgroundsFilters,
		BackgroundWithHtmlResponse
	>
	implements Backgrounds {

	constructor(
		dependencies: BackgroundRepositoryDatabase
			| SimpleRepositoryDependencies<
				SmallBackground,
				FullBackground,
				BackgroundsFilters,
				BackgroundWithHtmlResponse
			>,
	) {
		super("readStore" in dependencies ? dependencies : createSimpleRepositoryDependencies(
			dependencies,
			dependencies.smallBackgroundDao,
			dependencies.fullBackgroundDao,
			new BackgroundWithHtmlMapper(),
			smallItemProjectors.background,
			new BackgroundWithHtmlService(),
		));
	}

	async collectFiltersFromAllItems(allSmallItems: SmallBackground[]): Promise<BackgroundsFilters | null> {
		const sourcesSet: Set<string> = new Set();
		for (const background of allSmallItems) {
			sourcesSet.add(background.source.shortName + (background.source.group.shortName != "Basic" ? "*" : ""));
		}
		return createFilters<BackgroundsFilters>({
			sources: sortSources(Array.from(sourcesSet)),
		});
	}

	async groupItems(smallItems: SmallBackground[]): Promise<Group<SmallBackground>[]> {
		const groups = smallItems.reduce((acc, background) => {
			const source = background.source.name;
			(acc[source] ||= []).push(background);
			return acc;
		}, {} as { [key: string]: SmallBackground[] });

		const nameToShortName = new Map<string, string>();
		for (const background of smallItems) {
			const shortName = background.source.shortName + (background.source.group.shortName != "Basic" ? "*" : "");
			nameToShortName.set(background.source.name, shortName);
		}

		const groupsArray = Object.entries(groups)
			.map(([source, smallItems]) => ({ sort: source, smallItems: smallItems } as Group<SmallBackground>));

		const shortNames = Array.from(nameToShortName.values());
		const sortedShortNames = sortSources([...new Set(shortNames)]);

		return groupsArray.sort((a, b) => {
			const aShort = nameToShortName.get(a.sort) || a.sort;
			const bShort = nameToShortName.get(b.sort) || b.sort;
			const aIndex = sortedShortNames.indexOf(aShort);
			const bIndex = sortedShortNames.indexOf(bShort);
			return aIndex - bIndex;
		});
	}
}
