import { Plugin } from 'obsidian';
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import { registerMonsterMdCodeBlockProcessor } from "src/ui/components/processor/monster_md_code_block_processor";
import { registerSidePanelBestiary } from "src/ui/components/ribbon/side_panel_bestiary";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { registerThemeChangeListener } from './ui/theme';
import { registerSidePanelInitiativeTracker } from './ui/components/ribbon/side_panel_initiative_tracker';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { SpellbookRepository } from './data/repositories/SpellbookRepository';
import { registerSidePanelSpellbook } from './ui/components/ribbon/side_panel_spellbook';
import { registerSpellMdCodeBlockProcessor } from './ui/components/processor/spell_md_code_block_processor';
import { registerAddSpellCommand } from './ui/components/command/add_spell_command';
import { DmScreenRepository } from './data/repositories/DmScreenRepository';
import { registerSidePanelDmScreen } from './ui/components/ribbon/side_panel_dm_screen';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/databse/DB';
import { registerScreenMdCodeBlockProcessor } from './ui/components/processor/screen_md_code_block_processor';
import type { Bestiary } from './domain/repositories/Bestiary';
import type { DmScreen } from './domain/repositories/DmScreen';
import type { Spellbook } from './domain/repositories/Spellbook';
import type { Arsenal } from './domain/repositories/Arsenal';
import { ArsenalRepository } from './data/repositories/ArsenalRepository';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: DB;
	#bestiary: Bestiary;
	#spellbook: Spellbook;
	#dmScreen: DmScreen;
	#arsenal: Arsenal;
	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSidePanelInitiativeTracker(this, this.#uiEventListener);
			registerSidePanelBestiary(this, this.#bestiary, this.#uiEventListener);	
			registerSidePanelSpellbook(this, this.#spellbook, this.#uiEventListener);
			registerSidePanelDmScreen(this, this.#dmScreen, this.#uiEventListener);
			registerMonsterMdCodeBlockProcessor(this, this.#bestiary, this.#uiEventListener);
			registerSpellMdCodeBlockProcessor(this, this.#spellbook, this.#uiEventListener);
			registerScreenMdCodeBlockProcessor(this, this.#dmScreen, this.#uiEventListener);
			registerEncounterMdCodeBlockProcessor(this, this.#bestiary);
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
		this.#database = new DB(this.app, this.manifest);
		await this.#database.initialize();

		this.#bestiary = new BestiaryRepository(this.#database);
		await this.#bestiary.initialize();

		this.#spellbook = new SpellbookRepository(this.#database);
		await this.#spellbook.initialize();

		this.#dmScreen = new DmScreenRepository(this.#database);
		await this.#dmScreen.initialize();

		this.#arsenal = new ArsenalRepository(this.#database);
		await this.#arsenal.initialize();

		this.#uiEventListener = new UiEventListener(this.app, this.#bestiary, this.#spellbook, this.#dmScreen);

		callback();
	}

	#dispose() {
		this.#bestiary.dispose();
		this.#spellbook.dispose();
		this.#dmScreen.dispose();
		this.#database.dispose();
	}
}
