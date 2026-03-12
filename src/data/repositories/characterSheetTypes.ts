import type { CharacterCoins, EquipmentItem, WeaponItem } from "src/domain/models/character/CharacterEquipment";
import type { ClassEntry } from "src/domain/models/character/ClassEntry";
import type { CharacterProficiencies } from "src/domain/models/character/CharacterProficiencies";
import type { CharacterSpellbookState } from "src/domain/models/character/CharacterSpellbook";
import type { CharacterSubInfo } from "src/domain/models/character/CharacterInfo";
import type { CharacterTextSections } from "src/domain/models/character/CharacterText";
import type { CharacterVitality } from "src/domain/models/character/CharacterVitality";
import type { FullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";

export type CharacterSheetDaoLike = {
	readItemByUrl(url: string): Promise<unknown | null>;
};

export type CharacterSheetPersistence = {
	putItem(item: FullCharacterSheet): Promise<boolean>;
};

export type CharacterSubInfoField = keyof CharacterSubInfo;
export type CharacterEditorTextSection = keyof CharacterTextSections;
export type CharacterAbilityCode = keyof FullCharacterSheet["data"]["stats"];
export type CharacterEditorEquipmentChange = {
	coins: CharacterCoins;
	equipmentList: EquipmentItem[];
	equipmentText: string;
};
export type CharacterEditorCombatChange = WeaponItem[];
export type CharacterEditorVitalityChange = {
	vitality: CharacterVitality;
	conditions: string[];
};
export type CharacterEditorHeaderInfo = {
	classes: ClassEntry[];
	level: number;
	race: string;
	background?: string;
	playerName?: string;
	alignment?: string;
	experience: number;
};
export type CharacterEditorSpellbookChange = CharacterSpellbookState;
export type CharacterEditorProficienciesChange = CharacterProficiencies;
