import type { Field, CharacterInfo, CharacterSubInfo, SpellsInfo } from "./CharacterInfo";
import type { CharacterStats, CharacterSaves } from "./CharacterStats";
import type { CharacterSkills } from "./CharacterSkills";
import type { CharacterVitality } from "./CharacterVitality";
import type { WeaponItem, AttunementItem, CharacterCoins } from "./CharacterEquipment";
import type { CharacterTextSections } from "./CharacterText";

// Name field (simpler than full Field interface)
export interface NameField {
	value: string;
}

// Avatar field (image URLs)
export interface Avatar {
	jpeg?: string;
	webp?: string;
}

// Main character data structure (parsed from data string)
export interface CharacterData {
	isDefault: boolean;
	jsonType: "character";
	template: string;
	name: NameField;
	info: CharacterInfo;
	subInfo: CharacterSubInfo;
	spellsInfo: SpellsInfo;
	spells: Record<string, unknown>;
	spellsPact: Record<string, unknown>;
	proficiency: number;
	stats: CharacterStats;
	saves: CharacterSaves;
	skills: CharacterSkills;
	vitality: CharacterVitality;
	attunementsList: AttunementItem[];
	weaponsList: WeaponItem[];
	weapons: Record<string, unknown>;
	text: CharacterTextSections;
	coins: CharacterCoins;
	resources: Record<string, unknown>;
	bonusesSkills: Record<string, unknown>;
	bonusesStats: Record<string, unknown>;
	conditions: unknown[];
	avatar?: Avatar; // Character avatar images
	createdAt: string; // ISO date string
}
