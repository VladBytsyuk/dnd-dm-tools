import type { SmallCharacterSheet } from "./SmallCharacterSheet";
import type { CharacterSheetParsed } from "./CharacterSheet";
import { EmptySmallCharacterSheet } from "./SmallCharacterSheet";
import type { CharacterData } from "./CharacterData";
import type { CharacterSkills } from "./CharacterSkills";

export interface FullCharacterSheet extends SmallCharacterSheet, CharacterSheetParsed {
	id?: number; // Database auto-increment ID
}

/**
 * Creates an empty character sheet with minimal structure.
 * Most applications will populate this by importing from JSON.
 */
export function EmptyFullCharacterSheet(): FullCharacterSheet {
	const emptyEditorState = {
		id: "",
		data: { type: "doc", content: [] },
	};

	const data: CharacterData = {
		isDefault: false,
		jsonType: "character",
		template: "standard",
		name: { value: "" },
		info: {
			charClass: { name: "charClass", value: "" },
			charSubclass: { name: "charSubclass", value: "" },
			classes: { name: "classes", value: [] },
			level: { name: "level", value: 1 },
			background: { name: "background", value: "" },
			playerName: { name: "playerName", value: "" },
			race: { name: "race", value: "" },
			alignment: { name: "alignment", value: "" },
			experience: { name: "experience", value: "" },
			size: { value: "Средний" },
		},
		subInfo: {
			age: { name: "age", value: "" },
			height: { name: "height", value: "" },
			weight: { name: "weight", value: "" },
			eyes: { name: "eyes", value: "" },
			skin: { name: "skin", value: "" },
			hair: { name: "hair", value: "" },
		},
		spellsInfo: {
			base: { name: "base", value: "", code: "" },
			save: { name: "save", value: "" },
			mod: { name: "mod", value: "" },
		},
		spells: {},
		spellsPact: {},
		proficiency: 2,
		stats: {
			str: { name: "str", score: 10, modifier: 0 },
			dex: { name: "dex", score: 10, modifier: 0 },
			con: { name: "con", score: 10, modifier: 0 },
			int: { name: "int", score: 10, modifier: 0 },
			wis: { name: "wis", score: 10, modifier: 0 },
			cha: { name: "cha", score: 10, modifier: 0 },
		},
		saves: {
			str: { name: "str", isProf: false },
			dex: { name: "dex", isProf: false },
			con: { name: "con", isProf: false },
			int: { name: "int", isProf: false },
			wis: { name: "wis", isProf: false },
			cha: { name: "cha", isProf: false },
		},
		skills: {
			acrobatics: { name: "acrobatics", baseStat: "dex", isProf: 0 },
			"animal handling": { name: "animal handling", baseStat: "wis", isProf: 0 },
			arcana: { name: "arcana", baseStat: "int", isProf: 0 },
			athletics: { name: "athletics", baseStat: "str", isProf: 0 },
			deception: { name: "deception", baseStat: "cha", isProf: 0 },
			history: { name: "history", baseStat: "int", isProf: 0 },
			insight: { name: "insight", baseStat: "wis", isProf: 0 },
			intimidation: { name: "intimidation", baseStat: "cha", isProf: 0 },
			investigation: { name: "investigation", baseStat: "int", isProf: 0 },
			medicine: { name: "medicine", baseStat: "wis", isProf: 0 },
			nature: { name: "nature", baseStat: "int", isProf: 0 },
			perception: { name: "perception", baseStat: "wis", isProf: 0 },
			performance: { name: "performance", baseStat: "cha", isProf: 0 },
			persuasion: { name: "persuasion", baseStat: "cha", isProf: 0 },
			religion: { name: "religion", baseStat: "int", isProf: 0 },
			"sleight of hand": { name: "sleight of hand", baseStat: "dex", isProf: 0 },
			stealth: { name: "stealth", baseStat: "dex", isProf: 0 },
			survival: { name: "survival", baseStat: "wis", isProf: 0 },
		} as CharacterSkills,
		vitality: {
			"hp-max": { value: 0 },
			"hp-max-bonus": { value: 0 },
			"hit-die": { value: "" },
			"hp-dice-current": { value: 0 },
			"hp-dice-multi": { value: {} },
			ac: { value: 10 },
			shield: { value: false, mod: 0 },
			speed: { value: 30 },
			initiative: { value: 0 },
			isDying: false,
			// NEW FIELDS - Interactive vitality block
			"hp-current": { value: 0 },
			"hp-temp": { value: 0 },
			"death-saves-success": { value: 0 },
			"death-saves-fail": { value: 0 },
			"proficiency-bonus": { value: 2 },
			"passive-perception": { value: 10 },
			"darkvision": { value: 0 },
		},
		attunementsList: [],
		weaponsList: [],
		weapons: {},
		text: {
			attacks: { value: emptyEditorState },
			traits: { value: emptyEditorState },
			features: { value: emptyEditorState },
			feats: { value: emptyEditorState },
			equipment: { value: emptyEditorState },
			items: { value: emptyEditorState },
			appearance: { value: emptyEditorState },
			background: { value: emptyEditorState },
			allies: { value: emptyEditorState },
			personality: { value: emptyEditorState },
			ideals: { value: emptyEditorState },
			bonds: { value: emptyEditorState },
			flaws: { value: emptyEditorState },
			quests: { value: emptyEditorState },
			"notes-1": { value: emptyEditorState },
			"notes-2": { value: emptyEditorState },
			"notes-3": { value: emptyEditorState },
			"notes-4": { value: emptyEditorState },
			"notes-5": { value: emptyEditorState },
			"notes-6": { value: emptyEditorState },
			prof: { value: emptyEditorState },
		},
		coins: {
			gp: { value: 0 },
			sp: { value: 0 },
			cp: { value: 0 },
			pp: { value: 0 },
			ep: { value: 0 },
			total: { value: 0 },
		},
		resources: {},
		bonusesSkills: {},
		bonusesStats: {},
		conditions: [],
		createdAt: new Date().toISOString(),
	};

	return {
		...EmptySmallCharacterSheet(),
		tags: [],
		disabledBlocks: {
			"info-left": [],
			"info-right": [],
			"subinfo-left": [],
			"subinfo-right": [],
			"notes-left": [],
			"notes-right": [],
			_id: "",
		},
		edition: "2024",
		spells: {
			mode: "cards",
			prepared: [],
			book: [],
		},
		data,
		jsonType: "character",
		version: "2",
	};
}
