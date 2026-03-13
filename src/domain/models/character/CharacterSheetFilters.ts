import type { Filters } from "../common/Filters";

export interface CharacterSheetFilters extends Filters {
	classes: string[]; // Unique character classes
	levels: number[]; // Unique levels (1-20)
	races: string[]; // Unique races
}
