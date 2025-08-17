import { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type DB from "../databse/DB";
import type { DmScreen } from "src/domain/repositories/DmScreen";
import { BaseRepository } from "./BaseRepository";
import type { DmScreenGroupSqlTableDao } from "../databse/DmScreenGroupSqlTableDao";

export class DmScreenRepository 
    extends BaseRepository<DmScreenItem, DmScreenItem, any> 
    implements DmScreen {

    // ---- fields ----
    #dmScreenDao: DmScreenGroupSqlTableDao;
    #rootItems: DmScreenItem[] | undefined = undefined;     
    
    constructor(database: DB) {
        super(
            database,
            database.dmScreenGroupDao,
            database.dmScreenGroupDao,
        )
        this.#dmScreenDao = database.dmScreenGroupDao;
    }

    async initialize() {
        this.#rootItems = await this.#dmScreenDao.readChildren();
        super.initialize();
    }

    async getAllRootItems(): Promise<DmScreenItem[]> {
        if (this.#rootItems) return this.#rootItems;
        await this.initialize();
        return await this.getAllRootItems();
    }

    async getFilteredItems(searchValue: string): Promise<DmScreenItem[]> {
        return await super.getFilteredSmallItems(searchValue, null) || [];
    }

    async getChildrenCount(item: DmScreenItem): Promise<number> {
        return await this.#dmScreenDao.readChildrenCount(item.url) || 0;
    }

    async getChildren(item: DmScreenItem): Promise<DmScreenItem[]> {
        return await this.#dmScreenDao.readChildren(item.url) || [];
    }

    async getFullItem(item: DmScreenItem): Promise<DmScreenItem | null> {
        return await this.getFullItemByUrl(item.url);
    }

    async getFullItemByName(name: string): Promise<DmScreenItem | null> {
        const cachedFullItem = await this.#dmScreenDao.readItemByName(name) || null;
        if (cachedFullItem && cachedFullItem.description) {
            console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
            return cachedFullItem;
        }
        if (!cachedFullItem) return null;
        return await this.getFullItemByUrl(cachedFullItem.url);
    }

    async getFullItemByUrl(url: string): Promise<DmScreenItem | null> {
        const cachedFullItem = await this.#dmScreenDao.readItemByUrl(url) || null;
        if (cachedFullItem && cachedFullItem.description) {
            console.log(`Loaded ${cachedFullItem.name.rus} from local storage.`);
            return cachedFullItem;
        }
        console.log(`Item ${url} doesn't have a description in local storage.`);
        const fullItem = await this.fetchFromAPI(url);
        if (fullItem) {
            this.database.transaction(async () => {
                await this.#dmScreenDao.updateItem(fullItem);
            });
            console.log(`Updated ${url} in local storage.`)
        }
        return fullItem;
    }
}
