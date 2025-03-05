import { Plugin } from 'obsidian';
import { Bestiary } from "src/data/bestiary";
import { DndStatblockSettingsController } from "src/ui/components/settings/settings_controller";
import { registerSettingsTab } from "src/ui/components/settings/settings_tab";
import { registerMonsterMdCodeBlockProcessor } from "src/ui/components/processor/monster_md_code_block_processor";
import { registerSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { LayoutManager } from './ui/components/settings/layout_manager';
import { registerThemeChangeListener } from './ui/theme';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;
	#layoutManager: LayoutManager;
	#bestiary: Bestiary;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSettingsTab(this, this.#settingsController);
			registerSidePanelBestiary(this, this.#bestiary, this.#layoutManager);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary, this.#layoutManager);
			registerAddStatblockCommand(this, this.#bestiary);
			registerThemeChangeListener();
			console.log("dnd-dm-tools has been loaded.");
		});
	}

	onunload() {
		this.#dispose();
		console.log("dnd-dm-tools has been unloaded.");
	}

	// ---- private methods ----
	async #initialize(
		callback: () => void,
	) {
		this.#settingsController = new DndStatblockSettingsController(this);
		await this.#settingsController.initialize(() => this.#onLayoutStyleChanged());

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter);
		await this.#bestiary.initialize();

		this.#layoutManager = new LayoutManager(this.#settingsController.settings);

		callback();
	}

	#onLayoutStyleChanged() {
		this.#layoutManager.onChangeLayoutStyle();
	}

	#dispose() {
		this.#bestiary.dispose();
		this.#layoutManager.dispose();
	}
}
