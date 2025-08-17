import { Plugin } from 'obsidian';
import { registerThemeChangeListener } from './ui/theme';
import { registerEncounterMdCodeBlockProcessor } from './ui/components/processor/encounter_md_code_block_processor';
import { registerAddEncounterCommand } from './ui/components/command/add_encounter_command';
import { UiEventListener } from './data/ui_event_listener';
import type { IUiEventListener } from './domain/listeners/ui_event_listener';
import DB from './data/databse/DB';
import { registerSidePanelInitiativeTracker } from './ui/components/sidepanel/side_panel_initiative_tracker';
import { ArsenalFeature } from './ui/components/feature/ArsenalFeature';
import type { BaseFeature } from './ui/components/feature/BaseFeature';
import { BestiaryFeature } from './ui/components/feature/BestiaryFeature';
import { SpellbookFeature } from './ui/components/feature/SpellbookFeature';
import { DmScreenFeature } from './ui/components/feature/DmScreenFeature';
import { ArmoryFeature } from './ui/components/feature/ArmoryFeature';
import { EquipmentFeature } from './ui/components/feature/EquipmentFeature';
import { ArtifactoryFeature } from './ui/components/feature/ArtifactoryFeature';

export default class DndStatblockPlugin extends Plugin {

	// ---- fields ----
	#database: DB;

	private arsenalFeature: ArsenalFeature;
	private armoryFeature: ArmoryFeature;
	private equipmentFeature: EquipmentFeature;
	private artifactoryFeature: ArtifactoryFeature;
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
			() => this.armoryFeature,
			() => this.equipmentFeature,
			() => this.artifactoryFeature,
			() => this.dmScreenFeature,
		);

		this.arsenalFeature = new ArsenalFeature(this, this.#database, this.#uiEventListener);
		this.armoryFeature = new ArmoryFeature(this, this.#database, this.#uiEventListener);
		this.equipmentFeature = new EquipmentFeature(this, this.#database, this.#uiEventListener);
		this.artifactoryFeature = new ArtifactoryFeature(this, this.#database, this.#uiEventListener);
		this.bestiaryFeature = new BestiaryFeature(this, this.#database, this.#uiEventListener);
		this.spellbookFeature = new SpellbookFeature(this, this.#database, this.#uiEventListener);
		this.dmScreenFeature = new DmScreenFeature(this, this.#database, this.#uiEventListener);
		this.features = [
			this.arsenalFeature,
			this.armoryFeature,
			this.equipmentFeature,
			this.artifactoryFeature,
			this.bestiaryFeature,
			this.spellbookFeature,
			this.dmScreenFeature,
		];
		this.features.forEach(feature => feature.initialize());
		
		callback();
	}

	#dispose() {
		this.features.forEach(feature => feature.dispose());
	}
}
