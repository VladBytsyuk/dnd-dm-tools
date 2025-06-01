import type { DataAdapter } from "obsidian";
import type { DmScreenGroup } from "src/domain/dm_screen_group";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";

export class DmScreen {

    // ---- fields ----
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #groups: DmScreenGroup[];
    #cache: PersistentCache<DmScreenGroup>;       
    
    constructor(rootDir: string, dataAdapter: DataAdapter, settingsController: DndSettingsController) {
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
        this.#cache = new PersistentCache("dm_screen", 200, settingsController);
    }

    async initialize() {
        this.#groups = await this.#loadDmScreenGroups();
        await this.#cache.init();
    }

    async getAllGroups(): Promise<DmScreenGroup[]> {
        if (this.#groups) return this.#groups;
        await this.initialize();
        return await this.getAllGroups();
    }

    dispose() {}

    // ---- private functions ----
    async #loadDmScreenGroups(): Promise<DmScreenGroup[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.#rootDir}/data/dm_screen.json`;
            const data = await this.#dataAdapter.read(filePath);
            const dmScreenGroups = JSON.parse(data) as DmScreenGroup[];
            console.log(`Loaded ${dmScreenGroups.length} DM Screen groups from ${filePath}`);
            return dmScreenGroups;
        } catch (error) {
            console.error("Failed to load  DM Screen groups:", error);
            return [];  
        }
    }   
}