import { Plugin } from 'obsidian';
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import { registerMonsterMdCodeBlockProcessor } from "src/ui/components/processor/monster_md_code_block_processor";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { registerThemeChangeListener } from './ui/theme';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { SpellbookRepository } from './data/repositories/SpellbookRepository';
import { registerSpellMdCodeBlockProcessor } from './ui/components/processor/spell_md_code_block_processor';
import { registerAddSpellCommand } from './ui/components/command/add_spell_command';
import { DmScreenRepository } from './data/repositories/DmScreenRepository';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/databse/DB';
import { registerScreenMdCodeBlockProcessor } from './ui/components/processor/screen_md_code_block_processor';
import type { Bestiary } from './domain/repositories/Bestiary';
import type { DmScreen } from './domain/repositories/DmScreen';
import type { Spellbook } from './domain/repositories/Spellbook';
import type { Arsenal } from './domain/repositories/Arsenal';
import { ArsenalRepository } from './data/repositories/ArsenalRepository';
import type { Repository } from './domain/repositories/Repository';
import type { Armory } from './domain/repositories/Armory';
import { ArmoryRepository } from './data/repositories/ArmoryRepository';
import type { Equipment } from './domain/repositories/Equipment';
import { EquipmentRepository } from './data/repositories/EquipmentRepository';
import type { Artifactory } from './domain/repositories/Artifactory';
import { ArtifactoryRepository } from './data/repositories/ArtifactoryRepository';
import type { BaseSidePanel } from './ui/components/sidepanel/BaseSidePanel';
import { BestiarySidePanel } from './ui/components/sidepanel/BestiarySidePanel';
import { registerSidePanelInitiativeTracker } from './ui/components/sidepanel/side_panel_initiative_tracker';
import { SpellBookSidePanel } from './ui/components/sidepanel/SpellbookSidePanel';
import { DmScreenSidePanel } from './ui/components/sidepanel/DmScreenSidePanel';
import type { FullMonster } from './domain/models/monster/FullMonster';
import type { FullSpell } from './domain/models/spell/FullSpell';
import type { DmScreenItem } from './domain/models/dm_screen/DmScreenItem';
import { ArsenalSidePanel } from './ui/components/sidepanel/ArsenalSidePanel';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: DB;
	#bestiary: Bestiary;
	#spellbook: Spellbook;
	#dmScreen: DmScreen;
	#arsenal: Arsenal;
	#armory: Armory;
	#equipment: Equipment;
	#artifactory: Artifactory;
	#repositories: Repository<any, any, any>[];

	bestiarySidePanel: BestiarySidePanel;
	spellbookSidePanel: SpellBookSidePanel;
	dmScreenSidePanel: DmScreenSidePanel;
	arsenalSidePanel: ArsenalSidePanel;
	#sidePanels: BaseSidePanel<any, any, any>[];

	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			this.#sidePanels.forEach(sidePanel => sidePanel.register());
			registerSidePanelInitiativeTracker(this, this.#uiEventListener);
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
		this.#spellbook = new SpellbookRepository(this.#database);
		this.#dmScreen = new DmScreenRepository(this.#database);
		this.#arsenal = new ArsenalRepository(this.#database);
		this.#armory = new ArmoryRepository(this.#database);
		this.#equipment = new EquipmentRepository(this.#database);
		this.#artifactory = new ArtifactoryRepository(this.#database);
		this.#repositories = [
			this.#bestiary,
			this.#spellbook,
			this.#arsenal,
			this.#armory,
			this.#equipment,
			this.#artifactory,
			this.#dmScreen,
		];
		this.#repositories.forEach(async repository => await repository.initialize());

		this.#uiEventListener = new UiEventListener(
			this.app, 
			this.#bestiary, 
			this.#spellbook, 
			this.#arsenal, 
			this.#armory, 
			this.#equipment, 
			this.#artifactory, 
			this.#dmScreen,
			async (fullMonster: FullMonster) => { await this.bestiarySidePanel.open(fullMonster) },
			async (fullSpell: FullSpell) => { await this.spellbookSidePanel.open(fullSpell) },
			async (dmScreenItem: DmScreenItem) => { await this.dmScreenSidePanel.open(dmScreenItem) },
		);

		this.bestiarySidePanel = new BestiarySidePanel(this, this.#bestiary, this.#uiEventListener);
		this.spellbookSidePanel = new SpellBookSidePanel(this, this.#spellbook, this.#uiEventListener);
		this.dmScreenSidePanel = new DmScreenSidePanel(this, this.#dmScreen, this.#uiEventListener);
		this.arsenalSidePanel = new ArsenalSidePanel(this, this.#arsenal, this.#uiEventListener);
		this.#sidePanels = [
			this.bestiarySidePanel,
			this.spellbookSidePanel,
			this.dmScreenSidePanel,
			this.arsenalSidePanel,
		];

		callback();
	}

	#dispose() {
		this.#repositories.forEach(repository => repository.dispose());
	}
}
