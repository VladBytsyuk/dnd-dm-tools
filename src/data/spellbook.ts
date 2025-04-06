import type { DataAdapter } from "obsidian";
import { requestUrl } from 'obsidian';
import type { FullSpell, SmallSpell } from "src/domain/spell";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";

export class Spellbook {

    // ---- fields ----
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #smallSpellbook: SmallSpell[];
    #cache: PersistentCache<string, FullSpell>;

    // ---- public functions ----
    constructor(rootDir: string, dataAdapter: DataAdapter, settingsController: DndSettingsController) {
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
        this.#cache = new PersistentCache("spellbook", 1000, settingsController);
    }

    async initialize() {
        this.#smallSpellbook = await this.#loadSpellbookData();
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