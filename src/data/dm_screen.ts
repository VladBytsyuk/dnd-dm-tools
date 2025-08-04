import { requestUrl, type DataAdapter } from "obsidian";
import { DmScreenItem, EmptyDmScreenItem } from "src/domain/dm_screen_group";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";
import { TEXTS } from "src/res/texts_ru";
import type SQLiteService from "./sqlite/SQLiteService";

export interface IDmScreen {

    /**
     * Initializes the dm screen by loading data.
     * This method should be called before using any other methods of the dm screen.
     * It loads the dm screen items data.
     * @returns {Promise<void>} A promise that resolves when the dm screen is initialized.
     * TODO: rework error hadling
     */
    initialize(): Promise<void>;
    /**
     * Disposes of the dm screen resources.          
     * This method should be called when the dm screen is no longer needed to free up resources. 
     * It does not return a value.
     * @returns {void}
     */
    dispose(): void;

    /**
     * Returns all root dm screen items.
     * @returns {Promise<DmScreenItem[]} A promise that resolves to an array of root DmScreenItem objects.
     */
    getAllRootItems(): Promise<DmScreenItem[]>;
    /**
     * Returns all dm screen items that contain search value in its rus or eng name.
     * @param {string} searchValue - The string value to apply to dmm screen items.
     * @returns {Promise<DmScreenItem[]} A promise that resolves to an array of root DmScreenItem objects that match the search value.
     */
    getFilteredItems(searchValue: string): Promise<DmScreenItem[]>;

    /**
     * Returns count of children of given DmScreenItem.
     * @param {DmScreenItem} item - The DmScreenItem which children should be counted.
     * @returns {Promise<number>} A promise that resolves to a number of item children.
     */
    getChildrenCount(item: DmScreenItem): Promise<number>;
    /**
     * Returns children of given DmScreenItem.
     * @param {DmScreenItem} item - The DmScreenItem which children should be collected.
     * @returns {Promise<DmScreenItem[]>} A promise that resolves to an item children.
     */
    getChildren(item: DmScreenItem): Promise<DmScreenItem[]>;

    /**
     * Returns a dull dm screen item by its DmScreenItem object.
     * @param {DmScreenItem} item - dm screen item in a group
     * @returns {Promise<DmScreenItem | null>} A promise that resolves to a full dm screen item if found, or null if not found. 
     */
    getFullItem(item: DmScreenItem): Promise<DmScreenItem | null>;
    /**
     * Returns a dull dm screen item by its URL.
     * @param {string} url - The URL of the dm screen item to fetch
     * @returns {Promise<DmScreenItem | null>} A promise that resolves to a full dm screen item if found, or null if not found. 
     */
    getFullItemByUrl(url: string): Promise<DmScreenItem | null>;
}

export class DmScreen implements IDmScreen {

    // ---- fields ----
    #rootItems: DmScreenItem[] | undefined = undefined;     
    
    constructor(private database: SQLiteService) {}

    async initialize() {
        this.#rootItems = await this.database.dmScreenGroupDao?.readChildren();
    }

    dispose() {}

    async getAllRootItems(): Promise<DmScreenItem[]> {
        if (this.#rootItems) return this.#rootItems;
        this.initialize();
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