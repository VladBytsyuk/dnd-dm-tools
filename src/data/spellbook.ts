import type { DataAdapter } from "obsidian";
import { requestUrl } from 'obsidian';
import type { FullSpell, SmallSpell } from "src/domain/spell";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";
import { SpellbookFilters } from "src/domain/spellbook_filters";

export class Spellbook {

    // ---- fields ----
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #smallSpellbook: SmallSpell[];
    #filters: SpellbookFilters | null;
    #cache: PersistentCache<FullSpell>;

    // ---- public functions ----
    constructor(rootDir: string, dataAdapter: DataAdapter, settingsController: DndSettingsController) {
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
        this.#cache = new PersistentCache("spellbook", 1000, settingsController);
    }

    async initialize() {
        this.#smallSpellbook = await this.#loadSpellbookData();
        this.#filters = await this.#collectSpellbookFilters();
        await this.#cache.init();
    }

    async getAllSmallSpells(): Promise<SmallSpell[]> {
        if (this.#smallSpellbook) return this.#smallSpellbook;
        this.initialize();
        return await this.getAllSmallSpells();
    }
    
    async getAllSmallSpellsNames(): Promise<string[]> {
        const allSmallSpells = await this.getAllSmallSpells();
        return allSmallSpells.map(smallSpell => smallSpell.name.rus);
    }

    async getFullSpellByUrl(url: string): Promise<FullSpell | null> {
        const cachedFullSpell = this.#cache.get(url);
        if (cachedFullSpell) {
            console.log(`Loaded ${cachedFullSpell.name.rus} from local storage.`);
            return cachedFullSpell;
        }
        const fullSpell = await this.#fetchSpellFromAPI(url);
        if (fullSpell) this.#cache.set(url, fullSpell);
        return fullSpell;
    }
    
    async getFullSpellBySmallSpell(smallSpell: SmallSpell): Promise<FullSpell | null> {
        if (!smallSpell.url) return null;
        return await this.getFullSpellByUrl(smallSpell.url);
    }
    
    async getFullSpellByName(spellName: string): Promise<FullSpell | null> {
        const allSmallSpells = await this.getAllSmallSpells();
        const smallSpell = allSmallSpells.find(smallMonster => smallMonster.name.rus == spellName);
        if (smallSpell == null || smallSpell.url == null) {
            return null;
        } else {
            return await this.getFullSpellByUrl(smallSpell?.url);
        }
    }

    async getAllFilters(): Promise<SpellbookFilters | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallSpells(filters: SpellbookFilters): Promise<SmallSpell[]> {
        const allSmallSpells = await this.getAllSmallSpells();
        if (filters.levels.length === 0 && filters.schools.length === 0 && filters.sources.length === 0) {
            return allSmallSpells;
        }
        return allSmallSpells.filter(spell => {
            const matchesLevel = filters.levels.length === 0 || filters.levels.includes(spell.level);
            const matchesSchool = filters.schools.length === 0 || filters.schools.includes(spell.school);
            const matchesSource = filters.sources.length === 0 || filters.sources.includes(spell.source.shortName);
            return matchesLevel && matchesSchool && matchesSource;
        });
    }

    dispose() {
        this.#cache.clear();
    }

    // ---- private functions ----
    async #loadSpellbookData(): Promise<SmallSpell[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.#rootDir}/data/spellbook.json`;
            const data = await this.#dataAdapter.read(filePath);
            const smallSpells = JSON.parse(data) as SmallSpell[];
            console.log(`Loaded ${smallSpells.length} small spells from local storage.`);
            return smallSpells;
        } catch (error) {
            console.error("Failed to load spellbook data:", error);
            return [];
        }
    }

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
        return SpellbookFilters(Array.from(levelsSet), Array.from(schoolsSet), Array.from(sourcesSet));
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