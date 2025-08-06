import { requestUrl } from 'obsidian';
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import type DB from "../databse/DB";
import type { Bestiary } from 'src/domain/repositories/Bestiary';
import type { FullMonster } from 'src/domain/models/monster/FullMonster';


export class BestiaryRepository implements Bestiary {

	// ---- fields ----
    #smallBestiary: SmallMonster[] | undefined = undefined;
    #filters: BestiaryFilters | null;

    // ---- public functions ----
    constructor(private database: DB) {}

    async initialize() {
        this.#smallBestiary = await this.database.smallMonsterDao?.readAllItems(null, null);
        this.#filters = await this.#collectBestiaryFilters();
    }

    async getAllSmallMonsters(): Promise<SmallMonster[]> {
        if (this.#smallBestiary) return this.#smallBestiary;
        await this.initialize();
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

    async getAllFilters(): Promise<BestiaryFilters | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallMonsters(filters: BestiaryFilters): Promise<SmallMonster[]> {
        return await this.database.smallMonsterDao?.readAllItems(null, filters) || [];
    }

    dispose() {}

    // ---- private functions ----
    async #collectBestiaryFilters(): Promise<BestiaryFilters | null> {
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
        return BestiaryFilters(Array.from(typesSet), Array.from(challengeRatingsSet), Array.from(sourcesSet));
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
