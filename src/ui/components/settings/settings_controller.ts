import DndStatblockPlugin from "src/main";
import type { DndStatblockPluginSettings } from "src/ui/components/settings/settings";
import { LayoutStyle } from "./layout_style";

const DEFAULT_SETTINGS: DndStatblockPluginSettings = {
	layoutStyle: LayoutStyle.Dnd5e
}

export class DndStatblockSettingsController {

	// ---- fields ----
    #plugin: DndStatblockPlugin
    settings: DndStatblockPluginSettings;

    constructor(plugin: DndStatblockPlugin) {
        this.#plugin = plugin
    }

	// ---- methods ----
	async initialize() {
		await this.loadSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.#plugin.loadData());
	}

	async saveSettings() {
		await this.#plugin.saveData(this.settings);
	}
}