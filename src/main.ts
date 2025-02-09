import { Plugin } from 'obsidian';
import { DndStatblockSettingsController } from "src/settings/settings_controller";
import { DndStatblockSettingTab } from "src/settings/settings_tab";
import { Bestiary } from "src/data/bestiary";

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;
	#bestiary: Bestiary

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
		await this.#settingsController.initialize();

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter);
		await this.#bestiary.initialize();
	}

	#setupSettings() {
		this.addSettingTab(new DndStatblockSettingTab(this.app, this, this.#settingsController));
	}
}
