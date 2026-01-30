import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseRepository } from "./BaseRepository";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import { type BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import type { Backgrounds } from "src/domain/repositories/Backgrounds";
import type DB from "../database/DB";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";

export class BackgroundRepository
    extends BaseRepository<SmallBackground, FullBackground, BackgroundsFilters>
    implements Backgrounds {

    constructor(database: DB) {
        super(
            database,
            database.smallBackgroundDao,
            database.fullBackgroundDao,
        );
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

        // Create a map of full name to short name for sorting
        const nameToShortName = new Map<string, string>();
        for (const background of smallItems) {
            const shortName = background.source.shortName + (background.source.group.shortName != "Basic" ? "*" : "");
            nameToShortName.set(background.source.name, shortName);
        }

        const groupsArray = Object.entries(groups)
            .map(([source, smallItems]) => ({ sort: source, smallItems: smallItems } as Group<SmallBackground>));

        // Sort using the same logic as filter sources
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

    async getFullItemByUrl(url: string): Promise<FullBackground | null> {
        const cachedFullItem = await this.database.fullBackgroundDao?.readItemByUrl(url) || null;
        if (cachedFullItem) {
            console.log(`Loaded ${url} from local storage.`);
            return cachedFullItem;
        }
        const fullItem = await this.fetchFromAPI(url);
        if (fullItem) {
            const associatedUrl = fullItem.url;
            fullItem.url = url;
            fullItem.associatedUrl = associatedUrl;
            fullItem.associatedHtml = await this.fetchHtmlFromAPI(associatedUrl) ?? undefined;
        }
        if (fullItem) {
            this.database.transaction(async () => {
                await this.database.fullBackgroundDao?.createItem(fullItem);
            });
            console.log(`Put ${url} into local storage.`)
        }
        return fullItem;
    }
}
