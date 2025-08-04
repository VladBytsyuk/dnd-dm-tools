import type { BestiaryFilter } from "../bestiary_filters";
import type { FullMonster, SmallMonster } from "../monster";

export interface Bestiary {
    
    /**
     * Initializes the bestiary by loading data and filters.
     * This method should be called before using any other methods of the bestiary.
     * It loads the small monsters data and collects the available filters.
     * @returns {Promise<void>} A promise that resolves when the bestiary is initialized.
     * TODO: rework error hadling
     */
    initialize(): Promise<void>;
    /**
     * Disposes of the bestiary resources.          
     * This method should be called when the bestiary is no longer needed to free up resources. 
     * It does not return a value.
     * @returns {void}
     */
    dispose(): void;

    /**
     * Returns all filters from the bestiary.      
     * @returns {Promise<BestiaryFilter | null>} A promise that resolves to a BestiaryFilter object containing all 
     * available filters, or null if no filters are available.
     */
    getAllFilters(): Promise<BestiaryFilter | null>;

    /**
     * Returns all small monsters from the bestiary.
     * @returns {Promise<SmallMonster[]>} A promise that resolves to an array of SmallMonster objects.
     */
    getAllSmallMonsters(): Promise<SmallMonster[]>;
    /**
     * Returns all small monsters from the bestiary that match the given filters.
     * @param {BestiaryFilter} filters - The filters to apply to the small monsters.
     * @returns {Promise<SmallMonster[]>} A promise that resolves to an array of SmallMonster objects that match the filters.   
     */
    getFilteredSmallMonsters(filters: BestiaryFilter): Promise<SmallMonster[]>;

    /**
     * Returns all small monsters names from the bestiary.
     * @returns {Promise<string[]>} A promise that resolves to an array of strings containing the names of all small monsters.
     */ 
    getAllSmallMonstersNames(): Promise<string[]>;

    /**
     * Returns a full monster by its URL.
     * @param {string} url - The URL of the monster to fetch.
     * @returns {Promise<FullMonster | null>} A promise that resolves to a FullMonster object if found, or null if not found.
     */
    getFullMonsterByUrl(url: string): Promise<FullMonster | null>;
    /**
     * Returns a full monster by its name.
     * @param {string} monsterName - The name of the monster to fetch.
     * @returns {Promise<FullMonster | null>} A promise that resolves to a FullMonster object if found, or null if not found.
     */
    getFullMonsterByName(monsterName: string): Promise<FullMonster | null>;
    /**
     * Returns a full monster by its SmallMonster object.
     * @param {SmallMonster} smallMonster - The SmallMonster object to fetch the full monster for.
     * @returns {Promise<FullMonster | null>} A promise that resolves to a FullMonster object if found, or null if not found.
     */ 
    getFullMonsterBySmallMonster(smallMonster: SmallMonster): Promise<FullMonster | null>;
}
