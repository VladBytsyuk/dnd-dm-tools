import type { Group, Repository } from "src/domain/repositories/Repository";
import type DB from "../databse/DB";
import type { Dao } from "src/domain/Dao";
import { requestUrl } from "obsidian";
import type { BaseItem } from "src/domain/models/common/BaseItem";

export abstract class BaseRepository<
    SmallItem extends BaseItem, 
    FullItem extends SmallItem, 
    Filter
> implements Repository<SmallItem, FullItem, Filter> {

    // ---- fields ----
    #smallItems?: SmallItem[];
    #filters?: Filter;

    constructor(
        protected database: DB,
        private smallItemDao: Dao<SmallItem, Filter>,
        private fullItemDao: Dao<FullItem, unknown>,
    ) {}

    // ---- abstract functions ----
    async collectFiltersFromAllItems(allSmallItems: SmallItem[]): Promise<Filter | null> {
        return null;
    }

    // ---- public functions ----
    async initialize(): Promise<void> {
        const allSmallItems = await this.smallItemDao.readAllItems(null, null)
        this.#smallItems = allSmallItems;
        this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
    }

    dispose(): void {
        this.#smallItems = undefined;
        this.#filters = undefined;
    }

    async getAllFilters(): Promise<Filter | null> {
        if (this.#filters) return this.#filters;
        const allSmallItems = this.#smallItems ? this.#smallItems : await this.smallItemDao.readAllItems(null, null);
        this.#filters = await this.collectFiltersFromAllItems(allSmallItems) ?? undefined;
        return this.#filters ?? null;
    }

    async getAllSmallItems(): Promise<SmallItem[]> {
        if (this.#smallItems) return this.#smallItems;
        this.#smallItems = await this.smallItemDao.readAllItems(null, null) ?? [];
        return this.#smallItems;
    }

    async getFilteredSmallItems(
        name: string | null = null, 
        filter: Filter | null = null,
    ): Promise<SmallItem[]> {
        let allSmallItems = await this.smallItemDao.readAllItems(null, filter) || [];

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

    async getAllSmallItemNames(): Promise<string[]> {
        return await this.smallItemDao.readAllItemsNames() || [];
    }

    async getFullItemByUrl(url: string): Promise<FullItem | null> {
        const cachedFullItem = await this.fullItemDao?.readItemByUrl(url) || null;
        if (cachedFullItem) {
            console.log(`Loaded ${url} from local storage.`);
            return cachedFullItem;
        }
        const fullItem = await this.fetchFromAPI(url);
        if (!fullItem) return fullItem;

        if (!fullItem.url) {
            fullItem.url = url;
        }
        this.database.transaction(async () => {
            await this.fullItemDao?.createItem(fullItem);
        });
        console.log(`Put ${url} into local storage.`);
        return fullItem;
    }

    async getFullItemByName(name: string): Promise<FullItem | null> {
        const daoResult = await this.fullItemDao?.readItemByName(name) || null;
        if (daoResult) return daoResult;

        const smallItem = await this.smallItemDao?.readItemByName(name) || null;

        if (!smallItem) return null;
        return await this.getFullItemBySmallItem(smallItem);
    }

    async getFullItemBySmallItem(smallItem: SmallItem): Promise<FullItem | null> {
        if (!smallItem.url) return null;
        return await this.getFullItemByUrl(smallItem.url);
    }

    // ---- private functions ----   
    protected async fetchFromAPI(url: string): Promise<FullItem | null> {
        try {
            const response = await requestUrl({
                url: `https://ttg.club/api/v1/${url}`,
                method: 'POST',
            });
            if (response.status !== 200) {
                console.error(`HTTP error ${response.status} for URL: ${url}`);
                throw new Error(`HTTP error ${response.status}.`);
            }
            const data = await response.json;
            console.log(`Loaded ${url} from remote storage.`);
            return data as FullItem;
        } catch (error) {
            console.error("Failed to fetch item from API:", error);
            return null;
        }
    }
    
    protected async fetchHtmlFromAPI(url: string): Promise<string | null> {
        try {
            const response = await requestUrl({
                url: `https://ttg.club/${url}`,
                method: 'GET',
            });
            if (response.status !== 200) {
                console.error(`HTTP error ${response.status} for URL: ${url}`);
                throw new Error(`HTTP error ${response.status}.`);
            }
            const data = await response.text;
            console.log(`Loaded ${url} from remote storage.`);
            return data;
        } catch (error) {
            console.error("Failed to fetch item from API:", error);
            return null;
        }
    }

    async groupItems(smallItems: SmallItem[]): Promise<Group<SmallItem>[]> {
        return [];
    }

    async putItem(fullItem: FullItem): Promise<boolean> {
        if (!fullItem.url) {
            console.warn("Cannot put item without URL");
            return false;
        }

        try {
            const smallItem: SmallItem = {
                ...fullItem,
                type: this.toTypeString((fullItem as any).type),
            } as SmallItem;
            const existingSmallItem = await this.smallItemDao?.readItemByUrl(fullItem.url) || null;
            if (existingSmallItem) {
                await this.smallItemDao?.updateItem(smallItem);
                console.log(`Updated ${fullItem.url} in small local storage.`);
            } else {
                await this.smallItemDao?.createItem(smallItem);
                console.log(`Created ${fullItem.url} in small local storage.`);
            }

            const existingFullItem = await this.fullItemDao?.readItemByUrl(fullItem.url) || null;
            if (existingFullItem) {
                await this.fullItemDao?.updateItem(fullItem);
                console.log(`Updated ${fullItem.url} in full local storage.`);
            } else {
                await this.fullItemDao?.createItem(fullItem);
                console.log(`Created ${fullItem.url} in full local storage.`);
            }

            this.#smallItems = undefined;
            this.#filters = undefined;

            await this.initialize();
            return true;
        } catch (error) {
            console.error("Failed to put item:", error);
            return false;
        }
    }

    async deleteItem(url: string): Promise<boolean> {
        try {
            const existingFullItem = await this.fullItemDao?.readItemByUrl(url) || null;
            if (existingFullItem) {
                await this.fullItemDao?.deleteItemByUrl(url);
                console.log(`Deleted ${url} from full local storage.`);
            }

            const existingSmallItem = await this.smallItemDao?.readItemByUrl(url) || null;
            if (existingSmallItem) {
                await this.smallItemDao?.deleteItemByUrl(url);
                console.log(`Deleted ${url} from small local storage.`);
            }

            // Invalidate cache
            this.#smallItems = undefined;
            this.#filters = undefined;

            await this.initialize();
            return true;
        } catch (error) {
            console.error("Failed to put item:", error);
            return false;
        }
    }

    private toTypeString(type: any): string {
        return typeof type === "string" ? type : type?.name ?? "";
    }

    createEmptyFullItem(): FullItem | undefined {
        return undefined;
    }
}
