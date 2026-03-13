import CharacterSheetFullUi from "src/ui/layout/character/CharacterSheetFullUi.svelte";
import type { SmallCharacterSheet, FullCharacterSheet, CharacterSheetFilters } from "src/domain/models/character";
import { BaseMdCodeBlockProcessor } from "./BaseMdCodeBlockProcessor";

export class CharacterSheetMdCodeBlockProcessor extends BaseMdCodeBlockProcessor<
	SmallCharacterSheet,
	FullCharacterSheet,
	CharacterSheetFilters
> {
	getCodeBlockName() {
		return "charsheet";
	}

	getUi() {
		return CharacterSheetFullUi;
	}
}
