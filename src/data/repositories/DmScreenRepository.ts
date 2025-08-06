import { requestUrl } from "obsidian";
import { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type DB from "../databse/DB";
import type { DmScreen } from "src/domain/repositories/DmScreen";

export class DmScreenRepository implements DmScreen {

    // ---- fields ----
    #rootItems: DmScreenItem[] | undefined = undefined;     
    
    constructor(private database: DB) {}

    async initialize() {
        this.#rootItems = await this.database.dmScreenGroupDao?.readChildren();
    }

    dispose() {}

    async getAllRootItems(): Promise<DmScreenItem[]> {
        if (this.#rootItems) return this.#rootItems;
        await this.initialize();
        return await this.getAllRootItems();
    }

    async getFilteredItems(searchValue: string): Promise<DmScreenItem[]> {
        return await this.database.dmScreenGroupDao?.readAllItems(searchValue, null) || [];
    }

    async getChildrenCount(item: DmScreenItem): Promise<number> {
        return await this.database.dmScreenGroupDao?.readChildrenCount(item.url) || 0;
    }

    async getChildren(item: DmScreenItem): Promise<DmScreenItem[]> {
        return await this.database.dmScreenGroupDao?.readChildren(item.url) || [];
    }

    async getFullItem(item: DmScreenItem): Promise<DmScreenItem | null> {
        return await this.getFullItemByUrl(item.url);
    }

    async getFullItemByName(name: string): Promise<DmScreenItem | null> {
        const cachedFullItem = await this.database.dmScreenGroupDao?.readItemByName(name) || null;
        if (cachedFullItem && cachedFullItem.description) {
            console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
            return cachedFullItem;
        }
        if (!cachedFullItem) return null;
        return await this.getFullItemByUrl(cachedFullItem.url);
    }

    async getFullItemByUrl(url: string): Promise<DmScreenItem | null> {
        const cachedFullItem = await this.database.dmScreenGroupDao?.readItemByUrl(url) || null;
        if (cachedFullItem && cachedFullItem.description) {
            console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
            return cachedFullItem;
        }
        const fullItem = await this.#fetchScreenItemFromAPI(url);
        if (fullItem) {
            this.database.transaction(async () => {
                await this.database.dmScreenGroupDao?.updateItem(fullItem);
            });
        }
        return fullItem;
    }

    // ---- private functions ----
    async #fetchScreenItemFromAPI(url: string): Promise<DmScreenItem | null> {      
        const requestedUrl = `https://ttg.club/api/v1${url}`
        try {
            const response = await requestUrl({
                url: requestedUrl,
                method: 'POST',
            });
            if (response.status != 200) {
                console.error(`http code: ${response.status}`)
                throw new Error(`HTTP error ${response.status}.`);
            }
            const data = await response.json;
            console.log(`Loaded ${data.name.rus} from remote storage.`);
            return data as DmScreenItem;
        } catch (error) {
            console.error(`Failed to fetch DM Screen item from API by url: ${requestedUrl}`, error);
            return null;
        }
    }       
}
