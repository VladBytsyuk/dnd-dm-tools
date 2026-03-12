export type SpellcastingAbilityCode = "" | "str" | "dex" | "con" | "int" | "wis" | "cha";

export type SpellLevelKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export interface CharacterSpellEntry {
	id: string;
	name: string;
	level: number;
	prepared: boolean;
	linkedSpellUrl?: string;
}

export interface CharacterSpellLevelState {
	level: number;
	slotCountOverride: number | null;
	slotsUsed: boolean[];
	spells: CharacterSpellEntry[];
}

export interface CharacterSpellPactState {
	slotLevel: number;
	slotCountOverride: number | null;
	slotsUsed: boolean[];
}

export interface CharacterSpellbookState {
	baseAbilityCode: SpellcastingAbilityCode;
	saveDcOverride: number | null;
	attackBonusOverride: number | null;
	levels: Record<SpellLevelKey, CharacterSpellLevelState>;
	pact: CharacterSpellPactState | null;
}

export const SPELL_LEVEL_KEYS: SpellLevelKey[] = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
];

export function createEmptyCharacterSpellbook(): CharacterSpellbookState {
	return {
		baseAbilityCode: "",
		saveDcOverride: null,
		attackBonusOverride: null,
		levels: {
			"0": createSpellLevelState(0),
			"1": createSpellLevelState(1),
			"2": createSpellLevelState(2),
			"3": createSpellLevelState(3),
			"4": createSpellLevelState(4),
			"5": createSpellLevelState(5),
			"6": createSpellLevelState(6),
			"7": createSpellLevelState(7),
			"8": createSpellLevelState(8),
			"9": createSpellLevelState(9),
		},
		pact: null,
	};
}

export function createSpellLevelState(level: number): CharacterSpellLevelState {
	return {
		level,
		slotCountOverride: null,
		slotsUsed: [],
		spells: [],
	};
}
