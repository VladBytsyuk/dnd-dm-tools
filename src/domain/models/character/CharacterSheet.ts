import type { CharacterData } from "./CharacterData";
import {
	createEmptyCharacterProficiencies,
	type CharacterArmorProficiencies,
	type CharacterProficiencies,
} from "./CharacterProficiencies";

// Disabled UI blocks configuration
export interface DisabledBlocks {
	"info-left": string[];
	"info-right": string[];
	"subinfo-left": string[];
	"subinfo-right": string[];
	"notes-left": string[];
	"notes-right": string[];
	_id: string;
}

// Spells configuration
export interface SpellsConfig {
	mode: string;
	prepared: unknown[];
	book: unknown[];
}

// Root character sheet interface (with stringified data)
export interface CharacterSheet {
	tags: string[];
	disabledBlocks: DisabledBlocks;
	edition: string;
	spells: SpellsConfig;
	data: string; // Raw stringified JSON
	jsonType: "character";
	version: string;
}

// Character sheet with parsed data
export interface CharacterSheetParsed {
	tags: string[];
	disabledBlocks: DisabledBlocks;
	edition: string;
	spells: SpellsConfig;
	data: CharacterData; // Parsed typed object
	jsonType: "character";
	version: string;
}

/**
 * Parse stringified data field into typed CharacterData
 * @param sheet - Character sheet with stringified data
 * @returns Character sheet with parsed typed data
 */
export function parseCharacterData(sheet: CharacterSheet): CharacterSheetParsed {
	const parsedData = JSON.parse(sheet.data) as CharacterData;
	return {
		...sheet,
		data: normalizeCharacterData(parsedData),
	};
}

/**
 * Stringify data field for storage
 * @param sheet - Character sheet with parsed data
 * @returns Character sheet with stringified data
 */
export function stringifyCharacterData(sheet: CharacterSheetParsed): CharacterSheet {
	return {
		...sheet,
		data: JSON.stringify(sheet.data),
	};
}

export function normalizeCharacterData(data: CharacterData): CharacterData {
	return {
		...data,
		proficiencies: normalizeCharacterProficiencies(data.proficiencies),
	};
}

function normalizeCharacterProficiencies(
	proficiencies: CharacterProficiencies | undefined
): CharacterProficiencies {
	const defaults = createEmptyCharacterProficiencies();

	return {
		armor: normalizeArmorProficiencies(proficiencies?.armor, defaults.armor),
		weapons: { value: proficiencies?.weapons?.value ?? "" },
		languages: { value: proficiencies?.languages?.value ?? "" },
		tools: { value: proficiencies?.tools?.value ?? "" },
		other: { value: proficiencies?.other?.value ?? "" },
	};
}

function normalizeArmorProficiencies(
	armor: Partial<CharacterArmorProficiencies> | undefined,
	defaults: CharacterArmorProficiencies
): CharacterArmorProficiencies {
	return {
		light: armor?.light ?? defaults.light,
		medium: armor?.medium ?? defaults.medium,
		heavy: armor?.heavy ?? defaults.heavy,
		shield: armor?.shield ?? defaults.shield,
	};
}
