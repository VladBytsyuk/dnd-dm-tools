import { Plugin, type WorkspaceLeaf } from 'obsidian';
import { DndStatblockSettingsController } from "src/settings/settings_controller";
import { DndStatblockSettingTab } from "src/settings/settings_tab";
import { Bestiary } from "src/data/bestiary";
import { TEXTS } from "src/res/texts";
import { openSidePanelBestiary, SIDE_PANEL_BESTIARY_VIEW, SidePanelBestiaryView } from "src/view/side_panel_bestiary";
import { MonsterSuggester } from './suggest/monster_suggester';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;
	#bestiary: Bestiary;

	// ---- callbacks ----
	async onload() {
		this.#initialize()
		this.#setupSettings()
		this.#setupSidePanelBestiary()
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

	#setupSidePanelBestiary() {
		this.registerView(
            SIDE_PANEL_BESTIARY_VIEW,
            (leaf: WorkspaceLeaf) => new SidePanelBestiaryView(leaf, this, this.#bestiary)
        );
		this.addRibbonIcon("skull", TEXTS.ribbonActionTitle, async (mouseEvent) => {
			openSidePanelBestiary(mouseEvent.getModifierState("Meta"), this.app.workspace)
		});
	}
}
