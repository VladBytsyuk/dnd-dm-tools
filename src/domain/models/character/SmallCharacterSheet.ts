import type { BaseItem } from "../common/BaseItem";
import { EmptyName } from "../common/Name";

export interface SmallCharacterSheet extends BaseItem {
	charClass: string; // Character class
	level: number; // Character level
	race: string; // Character race
	playerName?: string; // Optional player name
}

export function EmptySmallCharacterSheet(): SmallCharacterSheet {
	return {
		name: EmptyName(),
		url: "",
		charClass: "",
		level: 1,
		race: "",
		playerName: "",
	};
}
