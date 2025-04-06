import DndPlugin from "src/main";
import type { DndStatblockPluginSettings as DndPluginSettings } from "src/ui/components/settings/settings";
import { LayoutStyle } from "./layout_style";

function defaultSettings(onLayoutStyleChanged: () => void): DndPluginSettings {
	return {
		cache: {},
		layoutStyle: LayoutStyle.Dnd5e,
		onLayoutStyleChanged: () => onLayoutStyleChanged(),
	} as DndPluginSettings
}

export class DndSettingsController {

	// ---- fields ----
    #plugin: DndPlugin
    settings: DndPluginSettings;

    constructor(plugin: DndPlugin) {
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