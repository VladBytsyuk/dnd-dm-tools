import type { DataAdapter } from "obsidian";

interface Entry<V> {
    timestamp: number;
    value: V;
}

const CHANGES_COUNT_TO_SAVE = 5;

export class PersistentCache<K, V> {

    #limit: number;
    #id: string;
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #map: Map<K, Entry<V>> = new Map();
    #changesCount: number = 0;

    constructor(
        id: string,
        limit: number,
        rootDir: string, 
        dataAdapter: DataAdapter,
    ) {
        this.#id = id;
        this.#limit = limit;
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
    }
    
    async init() {
        await this.#initializeWithPersistantStorage();
    }

    set(key: K, value: V) {
        this.#map.set(key, { timestamp: Date.now(), value: value });
        this.#handleLimits()
        this.#saveToPersistantStorageIfNeeded();
    }

    get(key: K): V | undefined {
        const result = this.#map.get(key)?.value;
        if (result) this.#map.set(key, { timestamp: Date.now(), value: result });
        return result;
    }

    delete(key: K) {
        this.#map.delete(key);
        this.#saveToPersistantStorageIfNeeded();
    }

    clear() {
        this.#map.clear()
        this.#saveToPersistantStorage()
    }

    #handleLimits() {
        while (this.#map.size > this.#limit) {
            let oldestKey: K | null = null;
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
            const data = await this.#dataAdapter.read(`${this.#rootDir}/cache/${this.#id}.json`);
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) throw new Error("Invalid format");
            this.#map = new Map(parsed as Array<[K, Entry<V>]>);
        } catch (e) {
            console.log(`PersistentCache<${this.#id}>: Cache init failed: ${e.message}`);
            this.#map = new Map();
        }
    }
    
    async #saveToPersistantStorage() {
        try {
            const data = JSON.stringify(Array.from(this.#map.entries()));
            await this.#dataAdapter.write(`${this.#rootDir}/cache/${this.#id}.json`, data);
        } catch (e) {
            console.log(`PersistentCache<${this.#id}>: Cache save failed: ${e.message}`);
        }
    }
}
