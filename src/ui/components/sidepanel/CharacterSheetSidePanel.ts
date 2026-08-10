import { mount } from "svelte";
import CharacterSheetSidePanelUi from "src/ui/layout/character/CharacterSheetSidePanelUi.svelte";
import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import { BaseSidePanel } from "./BaseSidePanel";

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
		const host = element as HTMLElement;
		host.style.display = "flex";
		host.style.flex = "1 1 auto";
		host.style.flexDirection = "column";
		host.style.height = "100%";
		host.style.minHeight = "0";
		host.style.width = "100%";
		host.style.maxWidth = "none";
		host.style.overflow = "hidden";

		return mount(CharacterSheetSidePanelUi, {
			target: element,
			props: {
				initialFullItem: this.fullItem,
				onBackToList: async () => {
					this.plugin.panelManager.discardPanel(this.getKey());
					await this.open(undefined);
				},
			},
		});
	}
}
