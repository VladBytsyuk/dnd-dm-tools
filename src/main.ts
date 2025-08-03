import { Plugin } from 'obsidian';
import { Bestiary, type IBestiary } from "src/data/bestiary";
import { DndSettingsController } from "src/ui/components/settings/settings_controller";
import { registerSettingsTab } from "src/ui/components/settings/settings_tab";
import { registerMonsterMdCodeBlockProcessor } from "src/ui/components/processor/monster_md_code_block_processor";
import { registerSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { registerThemeChangeListener } from './ui/theme';
import { registerSidePanelInitiativeTracker } from './ui/components/ribbon/side_panel_initiative_tracker';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { type ISpellbook, Spellbook } from './data/spellbook';
import { registerSidePanelSpellbook } from './ui/components/ribbon/side_panel_spellbook';
import { registerSpellMdCodeBlockProcessor } from './ui/components/processor/spell_md_code_block_processor';
import { registerAddSpellCommand } from './ui/components/command/add_spell_command';
import { DmScreen } from './data/dm_screen';
import { registerSidePanelDmScreen } from './ui/components/ribbon/side_panel_dm_screen';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import SQLiteService from './data/sqlite/SQLiteService';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: SQLiteService;
	#settingsController: DndSettingsController;
	#bestiary: IBestiary;
	#spellbook: ISpellbook;
	#dmScreen: DmScreen;
	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSettingsTab(this, this.#settingsController);
			registerSidePanelInitiativeTracker(this, this.#uiEventListener);
			registerSidePanelBestiary(this, this.#bestiary, this.#uiEventListener);	
			registerSidePanelSpellbook(this, this.#spellbook, this.#uiEventListener);
			registerSidePanelDmScreen(this, this.#dmScreen, this.#uiEventListener);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary, this.#uiEventListener);
			registerSpellMdCodeBlockProcessor(this, this.#spellbook, this.#uiEventListener);
			registerEncounterMdCodeBlockProcessor(this, this.#bestiary),
			registerAddStatblockCommand(this, this.#bestiary);
			registerAddSpellCommand(this, this.#spellbook);
			registerAddEncounterCommand(this);
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
		this.#database = new SQLiteService(this.app, this.manifest);
		await this.#database.initialize();

		this.#settingsController = new DndSettingsController(this);
		await this.#settingsController.initialize(() => this.#onLayoutStyleChanged());

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#bestiary.initialize();

		this.#spellbook = new Spellbook(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#spellbook.initialize();

		this.#dmScreen = new DmScreen(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#dmScreen.initialize();

		this.#uiEventListener = new UiEventListener(this.app, this.#bestiary, this.#spellbook, this.#dmScreen);

		callback();
	}

	#onLayoutStyleChanged() {
	}

	#dispose() {
		this.#bestiary.dispose();
		this.#spellbook.dispose();
		this.#dmScreen.dispose();
		this.#database.dispose();
	}
}
