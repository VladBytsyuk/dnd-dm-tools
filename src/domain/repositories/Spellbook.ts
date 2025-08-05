import type { FullSpell } from "../models/spell/FullSpell";
import type { SmallSpell } from "../models/spell/SmallSpell";
import type { SpellbookFilters } from "../spellbook_filters";

export interface Spellbook {

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
