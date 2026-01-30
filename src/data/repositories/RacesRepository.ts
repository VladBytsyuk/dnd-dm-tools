import type { SmallRace } from "src/domain/models/race/SmallRace";
import { type RaceFilters } from "src/domain/models/race/RaceFilters";
import type DB from "../database/DB";
import type { Races } from "src/domain/repositories/Races";
import { type FullRace, EmptyFullRace } from "src/domain/models/race/FullRace";
import { BaseRepository } from "./BaseRepository";
import { createFilters } from "src/domain/models/common/Filters";
import type { Group } from "src/domain/repositories/Repository";
import { baseRaces, collectSourceBooks } from "src/assets/data/races";
import { sortSources } from "src/domain/utils/SourceSorter";


export class RacesRepository
    extends BaseRepository<SmallRace, FullRace, RaceFilters>
    implements Races {

    private static readonly RACE_SOURCE_BOOKS = collectSourceBooks(baseRaces);

    constructor(database: DB) {
        super(
            database,
            database.smallRaceDao,
            database.fullRaceDao,
        );
    }

    protected override getApiRequestBody(url: string): object | undefined {
        return {
            filter: {
                book: RacesRepository.RACE_SOURCE_BOOKS
            }
        };
    }

    protected override mapApiResponse(data: any, url: string): FullRace {
        // Handle name - could be string or object with rus/eng
        const name = typeof data.name === 'string'
            ? { rus: data.name, eng: data.name }
            : {
                rus: data.name?.rus ?? '',
                eng: data.name?.eng ?? data.name?.rus ?? '',
            };

        // Determine the URL - prefer data.url, fall back to provided url
        const itemUrl = data.url ?? url;

        return {
            name,
            url: itemUrl,
            abilities: data.abilities ?? [],
            type: typeof data.type === 'string'
                ? { name: data.type }
                : data.type ?? { name: '' },
            source: {
                shortName: data.source?.shortName ?? '',
                name: data.source?.name ?? '',
                group: {
                    name: data.source?.group?.name ?? '',
                    shortName: data.source?.group?.shortName ?? '',
                },
                homebrew: data.source?.homebrew ?? false,
            },
            image: data.image,
            group: data.group,
            description: data.description ?? '',
            size: data.size ?? '',
            speed: data.speed ?? [],
            skills: data.skills ?? [],
            subraces: data.subraces?.map((subrace: any) => {
                const engName = typeof subrace.name === 'string'
                    ? subrace.name
                    : (subrace.name?.eng ?? subrace.name?.rus ?? '');
                const subraceUrlSuffix = engName.toLowerCase().replace(/\s+/g, '_');
                return this.mapApiResponse(subrace, `${itemUrl}/${subraceUrlSuffix}`);
            }),
        };
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
            sources: sortSources(Array.from(sourcesSet)),
        });
    }

    async groupItems(smallItems: SmallRace[]): Promise<Group<SmallRace>[]> {
        // Group races by type
        const groups = smallItems.reduce((acc, race) => {
            const type = race.type.name;
            (acc[type] ||= []).push(race);
            return acc;
        }, {} as { [key: string]: SmallRace[] });

        // Define priority order for race types
        const typeOrder: Record<string, number> = {
            'Базовые': 1,
            'Приключения': 2,
            'Сеттинги': 3,
            'Unearthed Arcana': 4,
            '3rd party': 5,
            'Homebrew': 6,
        };

        return Object.entries(groups)
            .map(([type, races]) => ({
                sort: type,
                smallItems: races
            } as Group<SmallRace>))
            .sort((a, b) => {
                const aOrder = typeOrder[a.sort] ?? 999;
                const bOrder = typeOrder[b.sort] ?? 999;
                if (aOrder !== bOrder) {
                    return aOrder - bOrder;
                }
                return a.sort.localeCompare(b.sort, 'ru-RU');
            });
    }

    createEmptyFullItem(): FullRace {
        return EmptyFullRace();
    }

    override async getFullItemByUrl(url: string): Promise<FullRace | null> {
        // Try to load from cache first
        const cachedRace = await this.database.fullRaceDao.readItemByUrl(url);
        if (cachedRace) {
            console.log(`Loaded ${url} from local storage.`);
            // Load subraces if not already populated
            if (!cachedRace.subraces) {
                cachedRace.subraces = await this.database.fullRaceDao.readSubracesByParentUrl(url);
            }
            return cachedRace;
        }

        // Fetch from API
        const fullRace = await this.fetchFromAPI(url);
        if (!fullRace) return null;

        if (!fullRace.url) {
            fullRace.url = url;
        }

        // Save to database with all subraces
        await this.database.transaction(async () => {
            // Save the main race
            await this.database.fullRaceDao.createItem(fullRace);

            // Save all subraces as separate rows
            if (fullRace.subraces && fullRace.subraces.length > 0) {
                await this.saveSubracesToDatabase(fullRace.subraces, fullRace.url);
            } else {
                console.log(`No subraces found for ${fullRace.url}`);
            }
        });

        console.log(`Put ${url} into local storage.`);
        return fullRace;
    }

    private async saveSubracesToDatabase(subraces: FullRace[], parentUrl: string): Promise<void> {
        for (const subrace of subraces) {
            console.log(`Saving subrace ${subrace.url} with parent ${parentUrl}`);
            await this.database.fullRaceDao.createItemWithParent(subrace, parentUrl);

            // Recursively save nested subraces (if any)
            if (subrace.subraces && subrace.subraces.length > 0) {
                await this.saveSubracesToDatabase(subrace.subraces, subrace.url);
            }
        }
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
