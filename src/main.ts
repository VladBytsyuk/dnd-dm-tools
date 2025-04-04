import { Plugin } from 'obsidian';
import { Bestiary } from "src/data/bestiary";
import { DndStatblockSettingsController } from "src/ui/components/settings/settings_controller";
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

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#settingsController: DndStatblockSettingsController;
	#monsterLayoutManager: MonsterLayoutManager;
	#spellLayoutManager: SpellLayoutManager;
	#bestiary: Bestiary;
	#spellbook: Spellbook;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSettingsTab(this, this.#settingsController);
			registerSidePanelInitiativeTracker(this);
			registerSidePanelBestiary(this, this.#bestiary, this.#monsterLayoutManager);
			registerSidePanelSpellbook(this, this.#spellbook, this.#spellLayoutManager);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary, this.#monsterLayoutManager);
			registerSpellMdCodeBlockProcessor(this, this.#spellbook, this.#spellLayoutManager);
			registerEncounterMdCodeBlockProcessor(this),
			registerAddStatblockCommand(this, this.#bestiary);
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
		this.#settingsController = new DndStatblockSettingsController(this);
		await this.#settingsController.initialize(() => this.#onLayoutStyleChanged());

		this.#bestiary = new Bestiary(`${this.manifest.dir}`, this.app.vault.adapter);
		await this.#bestiary.initialize();

		this.#spellbook = new Spellbook(`${this.manifest.dir}`, this.app.vault.adapter);
		await this.#spellbook.initialize();

		this.#monsterLayoutManager = new MonsterLayoutManager(this.app, this.#settingsController.settings);
		this.#spellLayoutManager = new SpellLayoutManager(this.app);

		callback();
	}

	#onLayoutStyleChanged() {
		this.#monsterLayoutManager.onChangeLayoutStyle();
	}

	#dispose() {
		this.#bestiary.dispose();
		this.#monsterLayoutManager.dispose();
	}
}
