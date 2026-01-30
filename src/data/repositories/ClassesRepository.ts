import type { SmallClass } from "src/domain/models/class/SmallClass";
import { type ClassesFilters } from "src/domain/models/class/ClassesFilters";
import type DB from "../database/DB";
import { EmptyFullClass, type FullClass } from 'src/domain/models/class/FullClass';
import { BaseRepository } from './BaseRepository';
import { createFilters } from "src/domain/models/common/Filters";
import type { Group, Repository } from "src/domain/repositories/Repository";
import { baseClasses, collectSourceBooks } from "src/assets/data/classes";


export class ClassesRepository
    extends BaseRepository<SmallClass, FullClass, ClassesFilters>
    implements Repository<SmallClass, FullClass, ClassesFilters> {

    private static readonly CLASS_SOURCE_BOOKS = collectSourceBooks(baseClasses);

    // Private cache for base classes only
    #baseClassesCache?: SmallClass[];
    #filtersCache?: ClassesFilters;

    constructor(database: DB) {
        super(
            database,
            database.smallClassDao,
            database.fullClassDao,
        );
    }

    protected override getApiRequestBody(url: string): object | undefined {
        return {
            filter: {
                book: ClassesRepository.CLASS_SOURCE_BOOKS
            }
        };
    }

    async initialize(): Promise<void> {
        // Get all items and filter to base classes only
        const allItems = await this.database.smallClassDao.readAllItems(null, null);
        this.#baseClassesCache = allItems.filter(item => !item.isArchetype);
        this.#filtersCache = await this.collectFiltersFromAllItems(this.#baseClassesCache) ?? undefined;
    }

    dispose(): void {
        this.#baseClassesCache = undefined;
        this.#filtersCache = undefined;
        super.dispose();
    }

    async getAllFilters(): Promise<ClassesFilters | null> {
        if (this.#filtersCache) return this.#filtersCache;
        const baseClasses = this.#baseClassesCache ?? (await this.getAllSmallItems());
        this.#filtersCache = await this.collectFiltersFromAllItems(baseClasses) ?? undefined;
        return this.#filtersCache ?? null;
    }

    async getArchetypesForClass(parentClassUrl: string): Promise<SmallClass[]> {
        return await this.database.smallClassDao?.readArchetypesByParentUrl(parentClassUrl) || [];
    }

    async getAllSmallItems(): Promise<SmallClass[]> {
        if (this.#baseClassesCache) return this.#baseClassesCache;
        // Only return base classes (filter out archetypes)
        const allItems = await this.database.smallClassDao.readAllItems(null, null);
        this.#baseClassesCache = allItems.filter(item => !item.isArchetype);
        return this.#baseClassesCache;
    }

    async getFilteredSmallItems(
        name: string | null = null,
        filter: ClassesFilters | null = null,
    ): Promise<SmallClass[]> {
        // Get all items from DAO (includes archetypes)
        let allSmallItems = await this.database.smallClassDao.readAllItems(null, filter) || [];

        // Filter out archetypes - only show base classes in list
        allSmallItems = allSmallItems.filter(item => !item.isArchetype);

        // Apply name search filter
        if (name) {
            const searchLower = name.toLocaleLowerCase('ru-RU');
            allSmallItems = allSmallItems.filter(item => {
                const rusNameLower = item.name.rus.toLocaleLowerCase('ru-RU');
                const engNameLower = item.name.eng.toLocaleLowerCase('ru-RU');

                return rusNameLower.includes(searchLower) || engNameLower.includes(searchLower);
            });
        }
        return allSmallItems;
    }

    async getFullItemByUrl(url: string): Promise<FullClass | null> {
        // 1. Check database cache
        const cachedFullItem = await this.database.fullClassDao?.readItemByUrl(url) || null;
        if (cachedFullItem) {
            console.log(`Loaded ${url} from local storage.`);
            return cachedFullItem;
        }

        // 2. Fetch from API (if available)
        const fullItem = await this.fetchFromAPI(url);
        if (fullItem) {
            // 3. Build fragment URL for HTML fetching
            // API might return "/classes/bard" or already a fragment URL
            const apiUrl = fullItem.url || url;
            const fragmentUrl = this.buildFragmentUrl(apiUrl);

            fullItem.url = url;
            fullItem.associatedUrl = fragmentUrl;

            // 4. Fetch HTML content from fragment URL
            fullItem.associatedHtml = await this.fetchHtmlFromAPI(fragmentUrl) ?? undefined;
        }

        // 5. Store in database
        if (fullItem) {
            this.database.transaction(async () => {
                await this.database.fullClassDao?.createItem(fullItem);
            });
            console.log(`Put ${url} into local storage.`);
        }

        return fullItem;
    }

    private buildFragmentUrl(classUrl: string): string {
        // If already a fragment URL, return as-is
        if (classUrl.includes('/fragment/')) {
            return classUrl;
        }

        // Convert "/classes/bard" → "/classes/fragment/bard"
        // Convert "/classes/bard/valor" → "/classes/fragment/bard/valor"
        const parts = classUrl.replace(/^\//, '').split('/');
        if (parts.length >= 2 && parts[0] === 'classes') {
            return `/${parts[0]}/fragment/${parts.slice(1).join('/')}`;
        }
        return classUrl;
    }

    async collectFiltersFromAllItems(allSmallItems: SmallClass[]): Promise<ClassesFilters | null> {
        const diceTypesSet = new Set<string>();
        const sourcesSet = new Set<string>();

        for (const classItem of allSmallItems) {
            diceTypesSet.add(classItem.dice);
            sourcesSet.add(classItem.source.shortName + (classItem.source.group.shortName != "Basic" ? "*" : ""));
        }

        return createFilters<ClassesFilters>({
            diceTypes: Array.from(diceTypesSet),
            sources: Array.from(sourcesSet)
        });
    }

    async groupItems(smallItems: SmallClass[]): Promise<Group<SmallClass>[]> {
        const groups = smallItems.reduce((acc, classItem) => {
            const sourceKey = classItem.source.shortName;
            (acc[sourceKey] ||= []).push(classItem);
            return acc;
        }, {} as { [key: string]: SmallClass[] });

        const priorityOrder = ['PHB', 'XGE', 'TCE'];

        return Object.entries(groups)
            .map(([sourceShortName, smallClasses]) => ({ sort: sourceShortName, smallItems: smallClasses }))
            .sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.sort);
                const bIndex = priorityOrder.indexOf(b.sort);

                // Both in priority list
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                // Only a in priority list
                if (aIndex !== -1) return -1;
                // Only b in priority list
                if (bIndex !== -1) return 1;
                // Neither in priority list - sort alphabetically
                return a.sort.localeCompare(b.sort);
            });
    }

    createEmptyFullItem(): FullClass | undefined {
        return EmptyFullClass();
    }
}
