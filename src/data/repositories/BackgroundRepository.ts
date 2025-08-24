import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseRepository } from "./BaseRepository";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import { type BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import type { Backgrounds } from "src/domain/repositories/Backgrounds";
import type DB from "../databse/DB";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";

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
            sources: Array.from(sourcesSet), 
        });
    }

    async groupItems(smallItems: SmallBackground[]): Promise<Group<SmallBackground>[]> {
        const names = new Map<string, string>();
        const groups = smallItems.reduce((acc, background) => {
            names.set(background.source.shortName, background.source.name);
            const source = background.source.shortName;
            (acc[source] ||= []).push(background);
            return acc;
        }, {} as { [key: string]: SmallBackground[] });

        return Object.entries(groups)
            .sort(([sourceA], [sourceB]) => sourceA.localeCompare(sourceB))
            .map(([source, smallBackgrounds]) => ({ sort: names.get(source), smallItems: smallBackgrounds } as Group<SmallBackground>));
    }
}