import type { CharacterData } from "./CharacterData";

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
	return {
		...sheet,
		data: JSON.parse(sheet.data) as CharacterData,
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
