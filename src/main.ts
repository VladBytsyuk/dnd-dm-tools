import { Plugin } from 'obsidian';
import { Bestiary, type IBestiary } from "src/data/bestiary";
import { DndSettingsController } from "src/ui/components/settings/settings_controller";
import { registerSettingsTab } from "src/ui/components/settings/settings_tab";
import { registerMonsterMdCodeBlockProcessor } from "src/ui/components/processor/monster_md_code_block_processor";
import { registerSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { MonsterLayoutManager } from './ui/components/settings/monster_layout_manager';
import { registerThemeChangeListener } from './ui/theme';
import { registerSidePanelInitiativeTracker } from './ui/components/ribbon/side_panel_initiative_tracker';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { Spellbook } from './data/spellbook';
import { registerSidePanelSpellbook } from './ui/components/ribbon/side_panel_spellbook';
import { SpellLayoutManager } from './ui/components/settings/spell_layout_manager';
import { registerSpellMdCodeBlockProcessor } from './ui/components/processor/spell_md_code_block_processor';
import { registerAddSpellCommand } from './ui/components/command/add_spell_command';
import { DmScreen } from './data/dm_screen';
import { registerSidePanelDmScreen } from './ui/components/ribbon/side_panel_dm_screen';
import { UiEventListener } from './data/ui_event_listener';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndSettingsController;
	#monsterLayoutManager: MonsterLayoutManager;
	#spellLayoutManager: SpellLayoutManager;
	#bestiary: IBestiary;
	#spellbook: Spellbook;
	#dmScreen: DmScreen;
	#uiEventListener: UiEventListener;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSettingsTab(this, this.#settingsController);
			registerSidePanelInitiativeTracker(this);
			registerSidePanelBestiary(this, this.#bestiary, this.#uiEventListener);	
			registerSidePanelSpellbook(this, this.#spellbook, this.#spellLayoutManager);
			registerSidePanelDmScreen(this, this.#dmScreen, this.#uiEventListener);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary, this.#monsterLayoutManager);
			registerSpellMdCodeBlockProcessor(this, this.#spellbook, this.#spellLayoutManager);
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
		this.#settingsController = new DndSettingsController(this);
		await this.#settingsController.initialize(() => this.#onLayoutStyleChanged());

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#bestiary.initialize();

		this.#spellbook = new Spellbook(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#spellbook.initialize();

		this.#dmScreen = new DmScreen(`${this.manifest.dir}`, this.app.vault.adapter, this.#settingsController);
		await this.#dmScreen.initialize();

		this.#uiEventListener = new UiEventListener(this.app, this.#bestiary, this.#spellbook, this.#dmScreen);

		this.#monsterLayoutManager = new MonsterLayoutManager(this.app, this.#settingsController.settings, this.#spellbook, this.#uiEventListener);
		this.#spellLayoutManager = new SpellLayoutManager(this.app, this.#spellbook, this.#uiEventListener);

		callback();
	}

	#onLayoutStyleChanged() {
		this.#monsterLayoutManager.onChangeLayoutStyle();
	}

	#dispose() {
		this.#bestiary.dispose();
		this.#spellbook.dispose();
		this.#dmScreen.dispose();
		this.#monsterLayoutManager.dispose();
		this.#spellLayoutManager.dispose();
	}
}
