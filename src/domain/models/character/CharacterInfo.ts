import type { ClassEntry } from './ClassEntry';

// Common field wrapper interface
export interface Field<T> {
	name: string;
	value: T;
	code?: string; // Optional for spell-related fields
}

// Basic character info
export interface CharacterInfo {
	// Legacy fields (maintained for backward compatibility)
	charClass: Field<string>;
	charSubclass: Field<string>;

	// NEW: Multiclass support
	classes?: Field<ClassEntry[]>;

	// Character properties
	level: Field<number>;
	background: Field<string>;
	playerName: Field<string>;
	race: Field<string>;
	alignment: Field<string>;
	experience: Field<string>;
	size: { value: string };
}

// Character physical attributes
export interface CharacterSubInfo {
	age: Field<string>;
	height: Field<string>;
	weight: Field<string>;
	eyes: Field<string>;
	skin: Field<string>;
	hair: Field<string>;
}

// Spellcasting info
export interface SpellsInfo {
	base: Field<string>;
	save: Field<string>;
	mod: Field<string>;
}
