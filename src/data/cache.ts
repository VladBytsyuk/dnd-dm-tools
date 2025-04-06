import type { DndSettingsController } from "src/ui/components/settings/settings_controller";

interface Entry<V> {
    timestamp: number;
    value: V;
}

const CHANGES_COUNT_TO_SAVE = 0;

export class PersistentCache<V> {

    #limit: number;
    #id: string;
    #settingsController: DndSettingsController;
    #map: Map<string, Entry<V>> = new Map();
    #changesCount: number = 0;

    constructor(
        id: string,
        limit: number,
        settingsController: DndSettingsController,
    ) {
        this.#id = id;
        this.#limit = limit;
        this.#settingsController = settingsController;
    }
    
    async init() {
        await this.#initializeWithPersistantStorage();
    }

    set(key: string, value: V) {
        const normalizedKey = this.#normalize(key);
        this.#map.set(normalizedKey, { timestamp: Date.now(), value: value });
        this.#handleLimits()
        this.#saveToPersistantStorageIfNeeded();
    }

    get(key: string): V | undefined {
        const normalizedKey = this.#normalize(key);
        const result = this.#map.get(normalizedKey)?.value;
        if (result) this.#map.set(normalizedKey, { timestamp: Date.now(), value: result });
        return result;
    }

    delete(key: string) {
        const normalizedKey = this.#normalize(key);
        this.#map.delete(normalizedKey);
        this.#saveToPersistantStorageIfNeeded();
    }

    clear() {
        this.#map.clear()
        this.#saveToPersistantStorage()
    }

    #normalize(input: string): string {
        return input.toLowerCase();
    }

    #handleLimits() {
        while (this.#map.size > this.#limit) {
            let oldestKey: string | null = null;
            let minTimestamp = Infinity;
            for (const [key, entry] of this.#map) {
                if (entry.timestamp < minTimestamp) {
                    minTimestamp = entry.timestamp;
                    oldestKey = key;
                }
            }
            if (oldestKey !== null) {
                this.#map.delete(oldestKey);
            }
        }
    }

    #saveToPersistantStorageIfNeeded() {
        this.#changesCount++;
        if (this.#changesCount > CHANGES_COUNT_TO_SAVE) {
            this.#saveToPersistantStorage();
            this.#changesCount = 0;
        }
    }

    async #initializeWithPersistantStorage() {
        try {
            const data = await this.#settingsController.settings.cache[this.#id] as string;
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) throw new Error("Invalid format");
            this.#map = new Map(parsed as Array<[string, Entry<V>]>);
        } catch (e) {
            console.log(`PersistentCache<${this.#id}>: Cache init failed: ${e.message}`);
            this.#map = new Map();
        }
    }
    
    async #saveToPersistantStorage() {
        try {
            const data = JSON.stringify(Array.from(this.#map.entries()));
            this.#settingsController.settings.cache[this.#id] = data;
            this.#settingsController.saveSettings();
        } catch (e) {
            console.log(`PersistentCache<${this.#id}>: Cache save failed: ${e.message}`);
        }
    }
}
