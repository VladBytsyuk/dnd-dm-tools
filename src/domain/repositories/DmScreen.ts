import type { DmScreenItem } from "../dm_screen_group";

export interface DmScreen {

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
     * Returns a dull dm screen item by its name.
     * @param {string} name - The name of the dm screen item to fetch
     * @returns {Promise<DmScreenItem | null>} A promise that resolves to a full dm screen item if found, or null if not found. 
     */
    getFullItemByName(name: string): Promise<DmScreenItem | null>;
    /**
     * Returns a dull dm screen item by its URL.
     * @param {string} url - The URL of the dm screen item to fetch
     * @returns {Promise<DmScreenItem | null>} A promise that resolves to a full dm screen item if found, or null if not found. 
     */
    getFullItemByUrl(url: string): Promise<DmScreenItem | null>;
}
