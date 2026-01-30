import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import { type FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import type DB from "../database/DB";
import type { Feats } from 'src/domain/repositories/Feats';
import { type FullFeat } from 'src/domain/models/feat/FullFeat';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { sortSources } from "src/domain/utils/SourceSorter";


export class FeatsRepository 
    extends BaseRepository<SmallFeat, FullFeat, FeatsFilters> 
    implements Feats {

    constructor(database: DB) {
        super(
            database,
            database.smallFeatDao,
            database.fullFeatDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallFeat[]): Promise<FeatsFilters | null> {
        const sourcesSet: Set<string> = new Set();
        for (const feat of allSmallItems) {
            sourcesSet.add(feat.source.shortName + (feat.source.group.shortName != "Basic" ? "*" : ""));
        }
        return createFilters<FeatsFilters>({
            sources: sortSources(Array.from(sourcesSet))
        });
    }

    async groupItems(smallItems: SmallFeat[]): Promise<Group<SmallFeat>[]> {
        const groups = smallItems.reduce((acc, feat) => {
            const source = feat.source.name;
            (acc[source] ||= []).push(feat);
            return acc;
        }, {} as { [key: string]: SmallFeat[] });

        // Create a map of full name to short name for sorting
        const nameToShortName = new Map<string, string>();
        for (const feat of smallItems) {
            const shortName = feat.source.shortName + (feat.source.group.shortName != "Basic" ? "*" : "");
            nameToShortName.set(feat.source.name, shortName);
        }

        const groupsArray = Object.entries(groups)
            .map(([source, smallItems]) => ({ sort: source, smallItems: smallItems } as Group<SmallFeat>));

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
}
