import { requestUrl } from 'obsidian';
import { SpellbookFilters } from "src/domain/spellbook_filters";
import type DB from "./sqlite/DB";
import type { Spellbook } from 'src/domain/repositories/Spellbook';
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { SmallSpell } from 'src/domain/models/spell/SmallSpell';

export class SpellbookRepository implements Spellbook {

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
