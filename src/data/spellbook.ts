import { requestUrl } from 'obsidian';
import type { FullSpell, SmallSpell } from "src/domain/spell";
import { SpellbookFilters } from "src/domain/spellbook_filters";
import type DB from "./sqlite/DB";

export interface ISpellbook {

    /**
     * Initializes the spellbook by loading data and filters.
     * This method should be called before using any other methods of the spellbook.
     * It loads the small spells data and collects the available filters.
     * @returns {Promise<void>} A promise that resolves when the spellbook is initialized.
     */
    initialize(): Promise<void>;
    /**
     * Disposes of the spellbook resources.
     * This method should be called when the spellbook is no longer needed to free up resources.
     * It does not return a value.
     * @returns {void}
     */
    dispose(): void;

    /**
     * Returns all small spells from the spellbook.
     * @returns {Promise<SmallSpell[]>} A promise that resolves to an array of SmallSpell objects.
     */
    getAllSmallSpells(): Promise<SmallSpell[]>;
    /**
     * Returns all small spells names from the spellbook.
     * @returns {Promise<string[]>} A promise that resolves to an array of strings containing the names of all small spells.
     */
    getAllSmallSpellsNames(): Promise<string[]>;

    /**
     * Returns a full spell by its URL.
     * @param {string} url - The URL of the spell to fetch.
     * @returns {Promise<FullSpell | null>} A promise that resolves to a FullSpell object if found, or null if not found.
     */ 
    getFullSpellByUrl(url: string): Promise<FullSpell | null>;
    /**
     * Returns a full spell by its small spell object.
     * @param {SmallSpell} smallSpell - The SmallSpell object to fetch the full spell for.   
     * @return {Promise<FullSpell | null>} A promise that resolves to a FullSpell object if found, or null if not found.
     */
    getFullSpellBySmallSpell(smallSpell: SmallSpell): Promise<FullSpell | null>;
    /**
     * Returns a full spell by its name.
     * @param {string} spellName - The name of the spell to fetch.
     * @returns {Promise<FullSpell | null>} A promise that resolves to a FullSpell object if found, or null if not found.
     */
    getFullSpellByName(spellName: string): Promise<FullSpell | null>;

    /**
     * Returns all filters from the spellbook.
     * @returns {Promise<SpellbookFilters | null>} A promise that resolves to a SpellbookFilters object containing all
     * available filters, or null if no filters are available.
     */
    getAllFilters(): Promise<SpellbookFilters | null>;
    /**
     * Returns all small spells from the spellbook that match the given filters.
     * @param {SpellbookFilters} filters - The filters to apply to the small spells.
     * @returns {Promise<SmallSpell[]>} A promise that resolves to an array of SmallSpell objects that match the filters.
     * If no filters are applied, it returns all small spells.
     */
    getFilteredSmallSpells(filters: SpellbookFilters): Promise<SmallSpell[]>;
}

export class Spellbook implements ISpellbook {

    // ---- fields ----
    #smallSpellbook: SmallSpell[] | undefined = undefined;
    #filters: SpellbookFilters | null;

    // ---- public functions ----
    constructor(private database: DB) {}

    async initialize() {
        this.#smallSpellbook = await this.database.smallSpellDao?.readAllItems(null, null) || [];
        this.#filters = await this.#collectSpellbookFilters();
    }

    async getAllSmallSpells(): Promise<SmallSpell[]> {
        if (this.#smallSpellbook) return this.#smallSpellbook;
        this.initialize();
        return await this.getAllSmallSpells();
    }
    
    async getAllSmallSpellsNames(): Promise<string[]> {
        return await this.database.smallSpellDao?.readAllItemsNames() || [];
    }

    async getFullSpellByUrl(url: string): Promise<FullSpell | null> {
        const cachedFullSpell = await this.database.fullSpellDao?.readItemByUrl(url) || null;
        if (cachedFullSpell) {
            console.log(`Loaded ${cachedFullSpell.name.rus} from local storage.`);
            return cachedFullSpell;
        }
        const fullSpell = await this.#fetchSpellFromAPI(url);
        if (fullSpell) {
            this.database.transaction(async () => {
                await this.database.fullSpellDao?.createItem(fullSpell);
            });
        }
        return fullSpell;
    }
    
    async getFullSpellBySmallSpell(smallSpell: SmallSpell): Promise<FullSpell | null> {
        if (!smallSpell.url) return null;
        return await this.getFullSpellByUrl(smallSpell.url);
    }
    
    async getFullSpellByName(spellName: string): Promise<FullSpell | null> {
        const daoResult = await this.database.fullSpellDao?.readItemByName(spellName) || null;
        if (daoResult) return daoResult;

        const smallSpell = await this.database.smallSpellDao?.readItemByName(spellName) || null;
        if (!smallSpell) return null;
        
        return this.getFullSpellByUrl(smallSpell.url);
    }

    async getAllFilters(): Promise<SpellbookFilters | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallSpells(filters: SpellbookFilters): Promise<SmallSpell[]> {
        return await this.database.smallSpellDao?.readAllItems(null, filters) || [];
    }

    dispose() {}

    // ---- private functions ----
    async #collectSpellbookFilters(): Promise<SpellbookFilters | null> {
        const smallSpells = await this.getAllSmallSpells();
        if (!smallSpells) return null;

        let levelsSet: Set<string> = new Set();
        let schoolsSet: Set<string> = new Set();
        let sourcesSet: Set<string> = new Set();
        for (const spell of smallSpells) {
            levelsSet.add(spell.level.toString());
            schoolsSet.add(spell.school);
            sourcesSet.add(spell.source.shortName);
        }
        return SpellbookFilters(Array.from(levelsSet).map(value => +value), Array.from(schoolsSet), Array.from(sourcesSet));
    }

    async #fetchSpellFromAPI(url: string): Promise<FullSpell | null> {
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
            return data as FullSpell;
        } catch (error) {
            console.error("Failed to fetch spell from API:", error);
            return null;
        }
    };
}
