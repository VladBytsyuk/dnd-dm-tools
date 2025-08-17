import { Plugin } from 'obsidian';
import { BestiaryRepository } from "src/data/repositories/BestiaryRepository";
import { BestiaryMdCodeBlockProcessor } from "src/ui/components/processor/BestiaryMdCodeBlockProcessor";
import { registerAddStatblockCommand } from './ui/components/command/add_statblock_command';
import { registerThemeChangeListener } from './ui/theme';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { SpellbookRepository } from './data/repositories/SpellbookRepository';
import { SpellbookMdCodeBlockProcessor } from './ui/components/processor/SpellbookMdCodeBlockProcessor';
import { registerAddSpellCommand } from './ui/components/command/add_spell_command';
import { DmScreenRepository } from './data/repositories/DmScreenRepository';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/databse/DB';
import { DmScreenMdCodeBlockProcessor } from './ui/components/processor/DmScreenMdCodeBlockProcessor';
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
import type { FullWeapon } from './domain/models/weapon/FullWeapon';
import { ArsenalFeature } from './ui/components/feature/ArsenalFeature';
import type { BaseFeature } from './ui/components/feature/BaseFeature';
import { BestiaryFeature } from './ui/components/feature/BestiaryFeature';
import { SpellbookFeature } from './ui/components/feature/SpellbookFeature';
import { DmScreenFeature } from './ui/components/feature/DmScreenFeature';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: DB;
	#bestiary: Bestiary;
	#spellbook: Spellbook;
	#repositories: Repository<any, any, any>[];

	private arsenalFeature: ArsenalFeature;
	private bestiaryFeature: BestiaryFeature;
	private spellbookFeature: SpellbookFeature;
	private dmScreenFeature: DmScreenFeature;
	private features: BaseFeature<any, any, any>[];

	#uiEventListener: IUiEventListener;

	// ---- callbacks ----
	async onload() {
		this.#initialize(() => {
			registerSidePanelInitiativeTracker(this, this.#uiEventListener);
			registerEncounterMdCodeBlockProcessor(this, this.bestiaryFeature.repository!);
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

		this.#uiEventListener = new UiEventListener(
			this.app,
			() => this.bestiaryFeature,
			() => this.spellbookFeature,
			() => this.arsenalFeature,
			() => this.dmScreenFeature,
		);

		this.arsenalFeature = new ArsenalFeature(this, this.#database, this.#uiEventListener);
		this.bestiaryFeature = new BestiaryFeature(this, this.#database, this.#uiEventListener);
		this.spellbookFeature = new SpellbookFeature(this, this.#database, this.#uiEventListener);
		this.dmScreenFeature = new DmScreenFeature(this, this.#database, this.#uiEventListener);
		this.features = [
			this.arsenalFeature,
			this.bestiaryFeature,
			this.spellbookFeature,
			this.dmScreenFeature,
		];
		this.features.forEach(feature => feature.initialize());
		
		callback();
	}

	#dispose() {
		this.features.forEach(feature => feature.dispose());
		this.#repositories.forEach(repository => repository.dispose());
	}
}
