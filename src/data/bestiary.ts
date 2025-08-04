import { requestUrl } from 'obsidian';
import type { FullMonster, SmallMonster } from "src/domain/monster";
import { BestiaryFilter } from "src/domain/bestiary_filters";
import type DB from "./sqlite/DB";

export interface IBestiary {
    
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

export class Bestiary implements IBestiary {

	// ---- fields ----
    #smallBestiary: SmallMonster[] | undefined = undefined;
    #filters: BestiaryFilter | null;

    // ---- public functions ----
    constructor(private database: DB) {}

    async initialize() {
        this.#smallBestiary = await this.database.smallMonsterDao?.readAllItems(null, null);
        this.#filters = await this.#collectBestiaryFilters();
    }

    async getAllSmallMonsters(): Promise<SmallMonster[]> {
        if (this.#smallBestiary) return this.#smallBestiary;
        this.initialize();
        return await this.getAllSmallMonsters();
    }

    async getAllSmallMonstersNames(): Promise<string[]> {
        return await this.database.smallMonsterDao?.readAllItemsNames() || [];
    }

    async getFullMonsterByUrl(url: string): Promise<FullMonster | null> {
        const cachedFullMonster = await this.database.fullMonsterDao?.readItemByUrl(url) || null;
        if (cachedFullMonster) {
            console.log(`Loaded ${cachedFullMonster.name.rus} from local storage.`);
            return cachedFullMonster;
        }
        const fullMonster = await this.#fetchCreatureFromAPI(url);
        if (fullMonster) {
            this.database.transaction(async () => {
                await this.database.fullMonsterDao?.createItem(fullMonster);
            });
        }
        return fullMonster;
    }

    async getFullMonsterBySmallMonster(smallMonster: SmallMonster): Promise<FullMonster | null> {
        if (!smallMonster.url) return null;
        return await this.getFullMonsterByUrl(smallMonster.url);
    }

    async getFullMonsterByName(monsterName: string): Promise<FullMonster | null> {
        const daoResult = await this.database.fullMonsterDao?.readItemByName(monsterName) || null;
        if (daoResult) return daoResult;

        const smallMonster = await this.database.smallMonsterDao?.readItemByName(monsterName) || null;
        if (!smallMonster) return null;

        return this.getFullMonsterByUrl(smallMonster.url);
    }

    async getAllFilters(): Promise<BestiaryFilter | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallMonsters(filters: BestiaryFilter): Promise<SmallMonster[]> {
        return await this.database.smallMonsterDao?.readAllItems(null, filters) || [];
    }

    dispose() {}

    // ---- private functions ----
    async #collectBestiaryFilters(): Promise<BestiaryFilter | null> {
        const smallMonsters = await this.getAllSmallMonsters();
        if (!smallMonsters) return null;

        let typesSet: Set<string> = new Set();
        let challengeRatingsSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const monster of smallMonsters) {
            typesSet.add(monster.type);
            challengeRatingsSet.add(monster.challengeRating);
            sourcesSet.add(monster.source.shortName + (monster.source.group.shortName != "Basic" ? "*" : ""));
        }
        return BestiaryFilter(Array.from(typesSet), Array.from(challengeRatingsSet), Array.from(sourcesSet));
    }

    async #fetchCreatureFromAPI(url: string): Promise<FullMonster | null> {
        try {
            const response = await requestUrl({
                url: `https://ttg.club/api/v1/${url}`,
                method: 'POST',
            });
            if (response.status != 200) {
                console.error(`http code: ${response.status}`)
                throw new Error(`HTTP error ${response.status}.`);
            }
            const data = await response.json;
            console.log(`Loaded ${data.name.rus} from remote storage.`);
            return data as FullMonster;
        } catch (error) {
            console.error("Failed to fetch creature from API:", error);
            return null;
        }
    };
}
