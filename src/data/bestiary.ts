import type { DataAdapter } from "obsidian";
import { requestUrl } from 'obsidian';
import type { FullMonster, SmallMonster } from "src/domain/monster";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";
import { BestiaryFilter } from "src/domain/bestiary_filters";

export class Bestiary {

	// ---- fields ----
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #smallBestiary: SmallMonster[];
    #filters: BestiaryFilter | null;
    #cache: PersistentCache<FullMonster>;

    // ---- public functions ----
    constructor(rootDir: string, dataAdapter: DataAdapter, settingsController: DndSettingsController) {
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
        this.#cache = new PersistentCache("bestiary", 200, settingsController);
    }

    async initialize() {
        this.#smallBestiary = await this.#loadBestiaryData();
        this.#filters = await this.#collectBestiaryFilters();
        await this.#cache.init();
    }

    async getAllSmallMonsters(): Promise<SmallMonster[]> {
        if (this.#smallBestiary) return this.#smallBestiary;
        this.initialize();
        return await this.getAllSmallMonsters();
    }

    async getAllSmallMonstersNames(): Promise<string[]> {
        const allSmallMosnters = await this.getAllSmallMonsters();
        return allSmallMosnters.map(smallMonster => smallMonster.name.rus);
    }

    async getFullMonsterByUrl(url: string): Promise<FullMonster | null> {
        const cachedFullMonster = this.#cache.get(url);
        if (cachedFullMonster) {
            console.log(`Loaded ${cachedFullMonster.name.rus} from local storage.`);
            return cachedFullMonster;
        }
        const fullMonster = await this.#fetchCreatureFromAPI(url);
        if (fullMonster) this.#cache.set(url, fullMonster);
        return fullMonster;
    }

    async getFullMonsterBySmallMonster(smallMonster: SmallMonster): Promise<FullMonster | null> {
        return await this.getFullMonsterByUrl(smallMonster.url);
    }

    async getFullMonsterByName(monsterName: string): Promise<FullMonster | null> {
        const allSmallMosnters = await this.getAllSmallMonsters();
        const smallMonster = allSmallMosnters.find(smallMonster => smallMonster.name.rus == monsterName);
        if (smallMonster == null) {
            return null;
        } else {
            return await this.getFullMonsterByUrl(smallMonster?.url);
        }
    }

    async getAllFilters(): Promise<BestiaryFilter | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallMonsters(filters: BestiaryFilter): Promise<SmallMonster[]> {
        const allSmallMonsters = await this.getAllSmallMonsters();
        if (filters.types.length === 0 && filters.challangeRatings.length === 0 && filters.sources.length === 0) {
            return allSmallMonsters;    
        }
        return allSmallMonsters.filter(monster => {
            const typeMatch = filters.types.length === 0 || filters.types.includes(monster.type);
            const challengeRatingMatch = filters.challangeRatings.length === 0 || filters.challangeRatings.includes(monster.challengeRating);
            const sourceMatch = filters.sources.length === 0 || filters.sources.includes(monster.source.shortName);
            return typeMatch && challengeRatingMatch && sourceMatch;    
        });
    }

    dispose() {}

    // ---- private functions ----
    async #loadBestiaryData(): Promise<SmallMonster[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.#rootDir}/data/bestiary.json`;
            const data = await this.#dataAdapter.read(filePath);
            const smallMonsters = JSON.parse(data) as SmallMonster[];
            console.log(`Loaded ${smallMonsters.length} small monsters from local storage.`);
            return smallMonsters;
        } catch (error) {
            console.error("Failed to load bestiary data:", error);
            return [];
        }
    }

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
