import { Plugin } from 'obsidian';
import { Bestiary } from "src/data/bestiary";
import { DndStatblockSettingsController } from "src/settings/settings_controller";
import { registerSettingsTab } from "src/settings/settings_tab";
import { registerMonsterMdCodeBlockProcessor } from "src/view/monster_md_code_block_processor";
import { registerSidePanelBestiary } from "src/view/side_panel_bestiary";

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;
	#bestiary: Bestiary;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSettingsTab(this, this.#settingsController);
			registerSidePanelBestiary(this, this.#bestiary);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary);
			console.log("obsidian-dnd-statblock has been loaded.");
		});
	}

	onunload() {
		console.log("obsidian-dnd-statblock has been unloaded.");
	}

	// ---- private methods ----
	async #initialize(
		callback: () => void,
	) {
		this.#settingsController = new DndStatblockSettingsController(this);
		await this.#settingsController.initialize();

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter);
		await this.#bestiary.initialize();

		callback();
	}
}
