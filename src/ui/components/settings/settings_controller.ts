import DndStatblockPlugin from "src/main";
import type { DndStatblockPluginSettings } from "src/ui/components/settings/settings";
import { LayoutStyle } from "./layout_style";

function defaultSettings(onLayoutStyleChanged: () => void): DndStatblockPluginSettings {
	return {
		layoutStyle: LayoutStyle.Dnd5e,
		onLayoutStyleChanged: () => onLayoutStyleChanged(),
	} as DndStatblockPluginSettings
}

export class DndStatblockSettingsController {

	// ---- fields ----
    #plugin: DndStatblockPlugin
    settings: DndStatblockPluginSettings;

    constructor(plugin: DndStatblockPlugin) {
        this.#plugin = plugin
    }

	// ---- methods ----
	async initialize(onLayoutStyleChanged: () => void) {
		await this.loadSettings(() => onLayoutStyleChanged());
	}

	async loadSettings(onLayoutStyleChanged: () => void) {
		this.settings = Object.assign({}, defaultSettings(onLayoutStyleChanged), await this.#plugin.loadData());
	}

	async saveSettings() {
		await this.#plugin.saveData(this.settings);
	}
}