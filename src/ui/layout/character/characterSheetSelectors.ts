import type { CharacterData } from "../../../domain/models/character/CharacterData";
import type { CharacterCoins, AttunementItem, WeaponItem } from "../../../domain/models/character/CharacterEquipment";
import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
import type { CharacterProficiencies } from "../../../domain/models/character/CharacterProficiencies";
import type { CharacterSaves, CharacterStats } from "../../../domain/models/character/CharacterStats";
import type { CharacterVitality } from "../../../domain/models/character/CharacterVitality";
import type { CharacterEditorHeaderInfo } from "../../../data/repositories/characterSheetTypes";

export type CharacterAbilityGroup = {
	key: keyof CharacterStats;
	label: string;
	fullName: string;
	skills: Array<{ key: string; label: string }>;
};

export function getCharacterHeaderInfo(data: CharacterData): CharacterEditorHeaderInfo {
	return {
		classes: data.info?.classes?.value || [],
		level: data.info?.level?.value || 1,
		race: data.info?.race?.value || "",
		background: data.info?.background?.value,
		playerName: data.info?.playerName?.value,
		alignment: data.info?.alignment?.value,
		experience: parseInt(data.info?.experience?.value || "0", 10) || 0,
	};
}

export function getCharacterStats(data: CharacterData): CharacterStats {
	const calculateMod = (score: number) => Math.floor((score - 10) / 2);
	return {
		str: { name: "str", score: data.stats?.str?.score || 10, modifier: calculateMod(data.stats?.str?.score || 10) },
		dex: { name: "dex", score: data.stats?.dex?.score || 10, modifier: calculateMod(data.stats?.dex?.score || 10) },
		con: { name: "con", score: data.stats?.con?.score || 10, modifier: calculateMod(data.stats?.con?.score || 10) },
		int: { name: "int", score: data.stats?.int?.score || 10, modifier: calculateMod(data.stats?.int?.score || 10) },
		wis: { name: "wis", score: data.stats?.wis?.score || 10, modifier: calculateMod(data.stats?.wis?.score || 10) },
		cha: { name: "cha", score: data.stats?.cha?.score || 10, modifier: calculateMod(data.stats?.cha?.score || 10) },
	};
}

export function getCharacterSaves(data: CharacterData): CharacterSaves {
	return {
		str: { name: "str", isProf: data.saves?.str?.isProf || false },
		dex: { name: "dex", isProf: data.saves?.dex?.isProf || false },
		con: { name: "con", isProf: data.saves?.con?.isProf || false },
		int: { name: "int", isProf: data.saves?.int?.isProf || false },
		wis: { name: "wis", isProf: data.saves?.wis?.isProf || false },
		cha: { name: "cha", isProf: data.saves?.cha?.isProf || false },
	};
}

export function getCharacterVitality(data: CharacterData): CharacterVitality {
	return data.vitality || {
		"hp-max": { value: 0 },
		"hp-max-bonus": { value: 0 },
		"hit-die": { value: "d8" },
		"hp-dice-current": { value: 0 },
		"hp-dice-multi": { value: {} },
		ac: { value: 10 },
		shield: { value: false, mod: 0 },
		speed: { value: 30 },
		initiative: { value: 0 },
		isDying: false,
		"hp-current": { value: 0 },
		"hp-temp": { value: 0 },
		"death-saves-success": { value: 0 },
		"death-saves-fail": { value: 0 },
		"proficiency-bonus": { value: 2 },
		"passive-perception": { value: 10 },
		"darkvision": { value: 0 },
	};
}

export function getCharacterConditions(data: CharacterData): string[] {
	return data.conditions || [];
}

export function getCharacterProficiency(data: CharacterData): number {
	return data.proficiency || 2;
}

export function getCharacterWeaponsList(data: CharacterData): WeaponItem[] {
	return data.weaponsList || [];
}

export function getCharacterProficiencies(data: CharacterData): CharacterProficiencies {
	return data.proficiencies;
}

export function getCharacterAttunementsList(data: CharacterData): AttunementItem[] {
	return (data.attunementsList || []).map((item) => ({
		id: item.id,
		value: item.value || "",
		checked: item.checked || false,
	}));
}

export function getCharacterCoins(data: CharacterData): CharacterCoins | undefined {
	if (!data.coins) return undefined;

	return {
		gp: { value: data.coins.gp?.value || 0 },
		sp: { value: data.coins.sp?.value || 0 },
		cp: { value: data.coins.cp?.value || 0 },
		pp: { value: data.coins.pp?.value || 0 },
		ep: { value: data.coins.ep?.value || 0 },
		total: { value: data.coins.total?.value || 0 },
	};
}

export const CHARACTER_ABILITY_GROUPS: CharacterAbilityGroup[] = [
	{ key: "str", label: "СИЛ", fullName: "Сила", skills: [{ key: "athletics", label: "Атлетика" }] },
	{
		key: "dex",
		label: "ЛОВ",
		fullName: "Ловкость",
		skills: [
			{ key: "acrobatics", label: "Акробатика" },
			{ key: "sleight of hand", label: "Ловкость рук" },
			{ key: "stealth", label: "Скрытность" },
		],
	},
	{ key: "con", label: "ТЕЛ", fullName: "Телосложение", skills: [] },
	{
		key: "int",
		label: "ИНТ",
		fullName: "Интеллект",
		skills: [
			{ key: "investigation", label: "Анализ" },
			{ key: "history", label: "История" },
			{ key: "arcana", label: "Магия" },
			{ key: "nature", label: "Природа" },
			{ key: "religion", label: "Религия" },
		],
	},
	{
		key: "wis",
		label: "МДР",
		fullName: "Мудрость",
		skills: [
			{ key: "perception", label: "Восприятие" },
			{ key: "survival", label: "Выживание" },
			{ key: "medicine", label: "Медицина" },
			{ key: "animal handling", label: "Обращение с животными" },
			{ key: "insight", label: "Проницательность" },
		],
	},
	{
		key: "cha",
		label: "ХАР",
		fullName: "Харизма",
		skills: [
			{ key: "performance", label: "Выступление" },
			{ key: "intimidation", label: "Запугивание" },
			{ key: "deception", label: "Обман" },
			{ key: "persuasion", label: "Убеждение" },
		],
	},
];
