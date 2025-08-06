import type { SmallWeapon } from 'src/domain/models/weapon/SmallWeapon';
import type { Arsenal } from 'src/domain/repositories/Arsenal';
import type DB from '../databse/DB';
import type { FullWeapon } from 'src/domain/models/weapon/FullWeapon';
import { requestUrl } from 'obsidian';
import { WeaponFilters } from 'src/domain/models/weapon/WeaponFilters';

export class ArsenalRepository implements Arsenal {

    // ---- fields ----
    #smallArsenal: SmallWeapon[] | undefined = undefined;
    #filters: WeaponFilters | null = null;

    // ---- public functions ----
    constructor(private database: DB) {}

    async initialize(): Promise<void> {
        this.#smallArsenal = await this.database.smallWeaponDao?.readAllItems(null, null);
        this.#filters = await this.#collectArsenalFilters();
    }

    async getAllSmallWeapons(): Promise<SmallWeapon[]> {
        if (this.#smallArsenal) return this.#smallArsenal;
        await this.initialize();
        return await this.getAllSmallWeapons();
    }

    async getAllSmallWeaponsNames(): Promise<string[]> {
        return await this.database.smallWeaponDao?.readAllItemsNames() || [];
    }

    async getFullWeaponByUrl(url: string): Promise<FullWeapon | null> {
        const cachedFullWeapon = await this.database.fullWeaponDao?.readItemByUrl(url) || null;
        if (cachedFullWeapon) {
            console.log(`Loaded ${cachedFullWeapon.name.rus} from local storage.`);
            return cachedFullWeapon;
        }
        const fullWeapon = await this.#fetchWeaponFromAPI(url);
        if (fullWeapon) {
            this.database.transaction(async () => {
                await this.database.fullWeaponDao?.createItem(fullWeapon);
            });
        }
        return fullWeapon;
    }

    async getFullWeaponByName(name: string): Promise<FullWeapon | null> {
        const daoResult = await this.database.fullWeaponDao?.readItemByName(name) || null;
        if (daoResult) return daoResult;

        const smallWeapon = await this.database.smallWeaponDao?.readItemByName(name) || null;
        if (!smallWeapon) return null;

        return this.getFullWeaponByUrl(smallWeapon.url);     
    }

    async getFullWeaponBySmallWeapon(smallWeapon: SmallWeapon): Promise<FullWeapon | null> {
        if (!smallWeapon.url) return null;
        return await this.getFullWeaponByUrl(smallWeapon.url);
    }

    async getAllFilters(): Promise<WeaponFilters | null> {
        if (this.#filters) return this.#filters;
        this.initialize();
        return await this.getAllFilters();
    }

    async getFilteredSmallMonsters(filters: WeaponFilters): Promise<SmallWeapon[]> {
        return await this.database.smallWeaponDao?.readAllItems(null, filters) || [];
    }

    dispose() {}

    // ---- private functions ----
    async #collectArsenalFilters(): Promise<WeaponFilters | null> {
        const smallWeapons = await this.getAllSmallWeapons();
        if (!smallWeapons) return null;

        let dicesSet: Set<string> = new Set();
        let typesSet: Set<string> = new Set();
        for (const weapon of smallWeapons) {
            dicesSet.add(weapon.damage.dice);
            typesSet.add(weapon.damage.type);
        }
        return WeaponFilters(Array.from(dicesSet), Array.from(typesSet));
    }

    async #fetchWeaponFromAPI(url: string): Promise<FullWeapon | null> {
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
            return data as FullWeapon;
        } catch (error) {
            console.error("Failed to fetch creature from API:", error);
            return null;
        }
    };
}
