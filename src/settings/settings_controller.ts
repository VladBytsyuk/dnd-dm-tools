import DndStatblockPlugin from "src/main";
import type { DndStatblockPluginSettings } from "src/settings/settings";

const DEFAULT_SETTINGS: DndStatblockPluginSettings = {
	mySetting: 'default'
}

export class DndStatblockSettingsController {

	// ---- fields ----
    #plugin: DndStatblockPlugin
    settings: DndStatblockPluginSettings;

    constructor(plugin: DndStatblockPlugin) {
        this.#plugin = plugin
    }

	// ---- methods ----
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.#plugin.loadData());
	}

	async saveSettings() {
		await this.#plugin.saveData(this.settings);
	}
}