import type { DmScreenItem } from "../models/dm_screen/DmScreenItem";
import type { Repository } from "./Repository";

export interface DmScreen extends Repository<DmScreenItem, DmScreenItem, any> {

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
     * Returns a full dm screen item by its DmScreenItem object.
     * @param {DmScreenItem} item - dm screen item in a group
     * @returns {Promise<DmScreenItem | null>} A promise that resolves to a full dm screen item if found, or null if not found. 
     */
    getFullItem(item: DmScreenItem): Promise<DmScreenItem | null>;
}
