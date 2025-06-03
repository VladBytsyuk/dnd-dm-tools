import { requestUrl, type DataAdapter } from "obsidian";
import { DmScreenGroup, EmptyDmScreenGroup } from "src/domain/dm_screen_group";
import { PersistentCache } from "./cache";
import type { DndSettingsController } from "src/ui/components/settings/settings_controller";
import type { DmScreenItem } from "src/domain/dm_screen_item";
import { TEXTS } from "src/res/texts_ru";

export class DmScreen {

    // ---- fields ----
    #rootDir: string;
    #dataAdapter: DataAdapter;
    #rootGroup: DmScreenGroup;
    #cache: PersistentCache<DmScreenItem>;       
    
    constructor(rootDir: string, dataAdapter: DataAdapter, settingsController: DndSettingsController) {
        this.#rootDir = rootDir;
        this.#dataAdapter = dataAdapter;
        this.#cache = new PersistentCache("dm_screen", 200, settingsController);
    }

    async initialize() {
        this.#rootGroup = await this.#loadDmScreenGroups();
        await this.#cache.init();
    }

    async getRootGroup(): Promise<DmScreenGroup> {
        if (this.#rootGroup) return this.#rootGroup;    
        await this.initialize();    
        return await this.getRootGroup();
    }

    async getScreenItemByUrl(url: string): Promise<DmScreenItem | null> {
        const cachedItem = this.#cache.get(url);
        if (cachedItem) {
            console.log(`Loaded ${cachedItem.name.rus} from local storage.`);
            return cachedItem;
        }
        const screenItem = await this.#fetchScreenItemFromAPI(url);
        if (screenItem) this.#cache.set(url, screenItem);
        return screenItem;
    }   

    dispose() {}

    // ---- private functions ----
    async #loadDmScreenGroups(): Promise<DmScreenGroup> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.#rootDir}/data/dm_screen.json`;
            const data = await this.#dataAdapter.read(filePath);
            const groups = JSON.parse(data) as DmScreenGroup[];
            console.log(`Loaded ${groups.length} DM Screen groups from local storage.`);
            return DmScreenGroup(
                { rus: TEXTS.dmScreenTitle, eng: '' },
                '',
                0,
                {      
                    shortName: '',
                    name: '',
                    group: { name: '', shortName: '' }
                },          
                undefined,
                undefined,
                undefined,        
                groups
            );
        } catch (error) {
            console.error("Failed to load  DM Screen groups:", error);
            return EmptyDmScreenGroup();  
        }
    }
    
    async #fetchScreenItemFromAPI(url: string): Promise<DmScreenItem | null> {      
        const requestedUrl = `https://ttg.club/api/v1${url}`
        try {
            const response = await requestUrl({
                url: requestedUrl,
                method: 'POST',
            });
            if (response.status != 200) {
                console.error(`http code: ${response.status}`)
                throw new Error(`HTTP error ${response.status}.`);
            }
            const data = await response.json;
            console.log(`Loaded ${data.name.rus} from remote storage.`);
            return data as DmScreenItem;
        } catch (error) {
            console.error(`Failed to fetch DM Screen item from API by url: ${requestedUrl}`, error);
            return null;
        }
    }       
}