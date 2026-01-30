import { mount } from "svelte";
import CharacterSheetSidePanelUi from "src/ui/layout/character/CharacterSheetSidePanelUi.svelte";
import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import { BaseSidePanel } from "./BaseSidePanel";

export class CharacterSheetSidePanel extends BaseSidePanel<
	SmallCharacterSheet,
	FullCharacterSheet,
	CharacterSheetFilters
> {
	getKey(): string {
		return "character-sheets";
	}

	getRibbonIconName(): string {
		return "user"; // Obsidian icon for character/user
	}

	getTitle(): string {
		return "Листы персонажей"; // Russian: "Character Sheets"
	}

	async mountSvelteComponent(element: Element) {
		mount(CharacterSheetSidePanelUi, {
			target: element,
			props: {
				initialFullItem: this.fullItem,
				repository: this.repository,
				uiEventListener: this.uiEventListener,
			},
		});
	}
}
