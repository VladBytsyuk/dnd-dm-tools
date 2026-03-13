import type { CharacterCoins, EquipmentItem, WeaponItem } from "src/domain/models/character/CharacterEquipment";
import type { ClassEntry } from "src/domain/models/character/ClassEntry";
import type { CharacterProficiencies } from "src/domain/models/character/CharacterProficiencies";
import type { CharacterSpellbookState } from "src/domain/models/character/CharacterSpellbook";
import type { CharacterSubInfo } from "src/domain/models/character/CharacterInfo";
import type { CharacterTextSections } from "src/domain/models/character/CharacterText";
import type { CharacterVitality } from "src/domain/models/character/CharacterVitality";
import type { FullCharacterSheet } from "src/domain/models/character/FullCharacterSheet";
import type { SmallCharacterSheet } from "src/domain/models/character/SmallCharacterSheet";
import type { CharacterSheetFilters } from "src/domain/models/character/CharacterSheetFilters";
import type { Group } from "src/domain/repositories/Repository";

export type CharacterSheetDaoLike = {
	readItemByUrl(url: string): Promise<unknown | null>;
};

export type CharacterSheetPersistence = {
	putItem(item: FullCharacterSheet): Promise<boolean>;
};

export type CharacterSheetGateway = CharacterSheetPersistence & {
	getAllFilters(): Promise<CharacterSheetFilters | null>;
	getFilteredSmallItems(
		name: string | null,
		filter: CharacterSheetFilters | null
	): Promise<SmallCharacterSheet[]>;
	getFullItemBySmallItem(smallItem: SmallCharacterSheet): Promise<FullCharacterSheet | null>;
	groupItems(smallItems: SmallCharacterSheet[]): Promise<Group<SmallCharacterSheet>[]>;
	importFromJson(jsonContent: string): Promise<FullCharacterSheet>;
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

export type CharacterSheetSessionStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export type CharacterSheetSessionState = {
	activeUrl: string | null;
	draft: FullCharacterSheet | null;
	isDirty: boolean;
	status: CharacterSheetSessionStatus;
	errorMessage: string | null;
	lastSavedAt: number | null;
};

export type CharacterSheetBrowserStatus = "idle" | "loading" | "importing" | "error";

export type CharacterSheetBrowserState = {
	searchBarValue: string;
	filters: CharacterSheetFilters;
	itemsStack: FullCharacterSheet[];
	currentItem?: FullCharacterSheet;
	groups: Group<SmallCharacterSheet>[];
	isFiltersOverlayOpen: boolean;
	fullFilters: CharacterSheetFilters | null;
	status: CharacterSheetBrowserStatus;
	errorMessage: string | null;
};
