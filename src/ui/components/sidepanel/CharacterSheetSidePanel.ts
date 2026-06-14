import { mount } from "svelte";
import CharacterSheetSidePanelUi from "src/ui/layout/character/CharacterSheetSidePanelUi.svelte";
import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import { BaseSidePanel } from "./BaseSidePanel";
import { CharacterSheetRepository } from "src/data/repositories/CharacterSheetRepository";

export class CharacterSheetSidePanel extends BaseSidePanel<
	SmallCharacterSheet,
	FullCharacterSheet,
	CharacterSheetFilters
> {
	getKey() {
		return "character-sheets" as const;
	}

	getRibbonIconName(): string {
		return "user"; // Obsidian icon for character/user
	}

	getTitle(): string {
		return "Листы персонажей"; // Russian: "Character Sheets"
	}

	async mountSvelteComponent(element: Element) {
		return mount(CharacterSheetSidePanelUi, {
			target: element,
			props: {
				initialFullItem: this.fullItem,
				repository: this.repository as CharacterSheetRepository,
				uiEventListener: this.uiEventListener,
				plugin: this.plugin,
			},
		});
	}
}
