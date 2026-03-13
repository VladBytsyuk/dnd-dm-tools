import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import { BaseFeature, type FeatureCommand } from "./BaseFeature";
import type DB from "src/data/database/DB";
import type { Repository } from "src/domain/repositories/Repository";
import { CharacterSheetRepository } from "src/data/repositories/CharacterSheetRepository";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type DndStatblockPlugin from "src/main";
import type { BaseSidePanel } from "../sidepanel/BaseSidePanel";
import { CharacterSheetSidePanel } from "../sidepanel/CharacterSheetSidePanel";
import type { BaseMdCodeBlockProcessor } from "../processor/BaseMdCodeBlockProcessor";
import { CharacterSheetMdCodeBlockProcessor } from "../processor/CharacterSheetMdCodeBlockProcessor";

export class CharacterSheetFeature extends BaseFeature<
	SmallCharacterSheet,
	FullCharacterSheet,
	CharacterSheetFilters
> {
	createRepository(database: DB): Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters> {
		return new CharacterSheetRepository(database);
	}

	createSidePanel(
		plugin: DndStatblockPlugin,
		repository: Repository<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters>,
		uiEventListener: IUiEventListener
	): BaseSidePanel<SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters> {
		return new CharacterSheetSidePanel(plugin, repository, uiEventListener);
	}

	createCodeBlockProcessor(): BaseMdCodeBlockProcessor<
		SmallCharacterSheet,
		FullCharacterSheet,
		CharacterSheetFilters
	> {
		return new CharacterSheetMdCodeBlockProcessor();
	}

	getCommands(): FeatureCommand[] {
		// No editor commands as per requirements
		return [];
	}
}
