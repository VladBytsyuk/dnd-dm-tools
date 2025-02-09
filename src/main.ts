import { Plugin } from 'obsidian';
import { DndStatblockSettingsController } from "src/settings/settings_controller";
import { DndStatblockSettingTab } from "src/settings/settings_tab";

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;

	// ---- callbacks ----
	async onload() {
		this.#initialize()
		this.#setupSettings()
	}

	onunload() {

	}

	// ---- private methods ----
	async #initialize() {
		this.#settingsController = new DndStatblockSettingsController(this);
		await this.#settingsController.loadSettings();
	}

	#setupSettings() {
		this.addSettingTab(new DndStatblockSettingTab(this.app, this, this.#settingsController));
	}
}
