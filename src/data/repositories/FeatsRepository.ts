import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import { type FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import type DB from "../database/DB";
import type { Feats } from 'src/domain/repositories/Feats';
import { type FullFeat } from 'src/domain/models/feat/FullFeat';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";


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
            sources: Array.from(sourcesSet)
        });
    }

    async groupItems(smallItems: SmallFeat[]): Promise<Group<SmallFeat>[]> {
        const groups = smallItems.reduce((acc, feat) => {
            const source = feat.source.name;
            (acc[source] ||= []).push(feat);
            return acc;
        }, {} as { [key: string]: SmallFeat[] });

        return Object.entries(groups)
            .map(([source, smallItems]) => ({ sort: source, smallItems: smallItems } as Group<SmallFeat>))
            .sort((a, b) => a.sort.localeCompare(b.sort));
    }
}
