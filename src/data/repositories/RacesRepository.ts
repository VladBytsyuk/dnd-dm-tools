import type { SmallRace } from "src/domain/models/race/SmallRace";
import { type RaceFilters } from "src/domain/models/race/RaceFilters";
import type DB from "../databse/DB";
import type { Races } from "src/domain/repositories/Races";
import { type FullRace, EmptyFullRace } from "src/domain/models/race/FullRace";
import { BaseRepository } from "./BaseRepository";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";


export class RacesRepository
    extends BaseRepository<SmallRace, FullRace, RaceFilters>
    implements Races {

    constructor(database: DB) {
        super(
            database,
            database.smallRaceDao,
            database.fullRaceDao,
        );
    }

    async collectFiltersFromAllItems(allSmallItems: SmallRace[]): Promise<RaceFilters | null> {
        const abilitiesSet: Set<string> = new Set();
        const typesSet: Set<string> = new Set();
        const sourcesSet: Set<string> = new Set();

        for (const race of allSmallItems) {
            // Collect ability keys
            for (const ability of race.abilities) {
                abilitiesSet.add(ability.key);
            }
            // Collect type names
            typesSet.add(race.type.name);
            // Collect sources with marker for non-basic
            sourcesSet.add(race.source.shortName + (race.source.group.shortName != "Basic" ? "*" : ""));
        }

        return createFilters<RaceFilters>({
            abilities: Array.from(abilitiesSet).sort(),
            types: Array.from(typesSet).sort(),
            sources: Array.from(sourcesSet).sort(),
        });
    }

    async groupItems(smallItems: SmallRace[]): Promise<Group<SmallRace>[]> {
        // Group races by type
        const groups = smallItems.reduce((acc, race) => {
            const type = race.type.name;
            (acc[type] ||= []).push(race);
            return acc;
        }, {} as { [key: string]: SmallRace[] });

        return Object.entries(groups)
            .map(([type, races]) => ({
                sort: type,
                smallItems: races
            } as Group<SmallRace>))
            .sort((a, b) => a.sort.localeCompare(b.sort, 'ru-RU'));
    }

    createEmptyFullItem(): FullRace {
        return EmptyFullRace();
    }

    // Optional: Get races with hierarchy reconstructed
    async getRacesWithSubraces(): Promise<SmallRace[]> {
        const flatRaces = await this.database.smallRaceDao.readAllItemsWithParentUrl(null, null);
        return this.reconstructHierarchy(flatRaces);
    }

    // Optional: Get top-level races only
    async getTopLevelRaces(name: string | null, filters: RaceFilters | null): Promise<SmallRace[]> {
        return await this.database.smallRaceDao.readTopLevelRaces(name, filters);
    }

    // Optional: Get subraces for a specific race
    async getSubraces(parentUrl: string): Promise<SmallRace[]> {
        return await this.database.smallRaceDao.readSubracesByParentUrl(parentUrl);
    }

    private reconstructHierarchy(flatRaces: Array<{race: SmallRace, parentUrl: string | null}>): SmallRace[] {
        // Build a map of url -> race with empty subraces array
        const raceMap = new Map<string, SmallRace>();
        for (const item of flatRaces) {
            raceMap.set(item.race.url, { ...item.race, subraces: [] });
        }

        // Build hierarchy
        const topLevel: SmallRace[] = [];
        for (const item of flatRaces) {
            const race = raceMap.get(item.race.url)!;
            if (item.parentUrl) {
                const parent = raceMap.get(item.parentUrl);
                if (parent && parent.subraces) {
                    parent.subraces.push(race);
                }
            } else {
                topLevel.push(race);
            }
        }

        return topLevel;
    }
}
