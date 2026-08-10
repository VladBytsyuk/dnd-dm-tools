import { calculateModifier } from "./modifier";
import { Dice, rollRaw, type Formula, type FormulaEntry } from "./dice";
import type { FullMonster } from "./models/monster/FullMonster";
import type { EncounterParticipant } from "./models/encounter/EncounterParticipant";
import type { FullCharacterSheet } from "./models/character";
import { SPELL_LEVEL_KEYS } from "./models/character/CharacterSpellbook";

export const mapMonsterToEncounterParticipant = (monster: FullMonster): EncounterParticipant => {
    const newName = monster.name.rus
    let hp: number;
    if (monster.hits?.formula) {
        if (monster?.hits?.sign && monster?.hits?.bonus) {
            const diceFormula = `${monster?.hits?.formula}${monster?.hits?.sign}${monster?.hits?.bonus}`;
            const rollResult = rollRaw(diceFormula);
            hp = rollResult;
        } else {
            const rollResult = rollRaw(monster?.hits?.formula);
            hp = rollResult;
        }
    } else {
        const averageHp = monster.hits?.average ?? 0;
        hp = averageHp;
    }
    const wisdomModifier = calculateModifier(monster?.ability?.wiz ?? 0);
    const passivePerception: number = +(monster?.senses?.passivePerception
        ?? `${(10 + (monster?.skills?.find(s => s.name.toLowerCase() === 'восприятие')?.value as number || wisdomModifier))}`);
    return {
        id: Date.now(),
        url: monster.url,
        imageUrl: monster.images?.first(),
        initiative: 0,
        initiativeModifier: calculateModifier(monster?.ability?.dex ?? 0),
        name: newName,
        hpCurrent: hp,
        hpTemporary: 0,
        hpMax: hp,
        armorClass: monster.armorClass,
        passivePerception: passivePerception,
        side: "enemy",
        isDead: false,
        conditions: [],
        spellSlots: [],
        resources: [],
        colorHex: "#94a3b8",
    } as EncounterParticipant;
};

export const mapCharacterSheetToEncounterParticipant = (
	character: FullCharacterSheet,
): EncounterParticipant | null => {
	const data = character.data;
	const vitality = data.vitality;
	const hpMax = readNumber(vitality?.["hp-max"]?.value);
	const hpCurrent = readNumber(vitality?.["hp-current"]?.value ?? hpMax);
	const hpTemporary = readNumber(vitality?.["hp-temp"]?.value ?? 0);
	const armorClass = readNumber(vitality?.ac?.value);
	const initiativeModifier = readNumber(vitality?.initiative?.value);
	const passivePerception = readNumber(vitality?.["passive-perception"]?.value);
	const name = character.name.rus || character.name.eng || data.name?.value;

	if (
		!name ||
		hpMax === null ||
		hpCurrent === null ||
		hpTemporary === null ||
		armorClass === null ||
		initiativeModifier === null ||
		passivePerception === null
	) {
		return null;
	}

	return {
		id: Date.now(),
		url: character.url,
		imageUrl: data.avatar?.webp ?? data.avatar?.jpeg,
		initiative: 0,
		initiativeModifier,
		name,
		hpCurrent,
		hpTemporary,
		hpMax,
		armorClass,
		passivePerception,
		side: "pc",
		isDead: false,
		conditions: (data.conditions ?? []).map((url) => ({ url, expiresOnRound: null })),
		spellSlots: mapCharacterSpellSlots(character),
		resources: mapCharacterResources(character),
		colorHex: "#60a5fa",
	};
};

function mapCharacterSpellSlots(character: FullCharacterSheet): EncounterParticipant["spellSlots"] {
	const levels = character.data.spells?.levels;
	if (!levels) return [];

	return SPELL_LEVEL_KEYS
		.filter((levelKey) => levelKey !== "0")
		.map((levelKey) => {
			const level = levels[levelKey];
			const total = readNumber(level?.slotCountOverride);
			if (!total || total <= 0) return null;
			return {
				level: Number(levelKey) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
				total,
				used: Array.isArray(level.slotsUsed)
					? level.slotsUsed.filter(Boolean).length
					: 0,
			};
		})
		.filter((slot): slot is NonNullable<typeof slot> => slot !== null);
}

function mapCharacterResources(character: FullCharacterSheet): EncounterParticipant["resources"] {
	const resources = character.data.resources;
	if (!resources || typeof resources !== "object") return [];

	return Object.entries(resources)
		.map(([id, value]) => {
			if (!value || typeof value !== "object") return null;
			const record = value as Record<string, any>;
			const name = readString(record.name ?? record.label ?? record.title ?? id);
			const total = readNumber(record.total?.value ?? record.total ?? record.max?.value ?? record.max);
			const used = readNumber(record.used?.value ?? record.used ?? 0);
			if (!name || total === null || used === null) return null;
			return { id, name, total, used };
		})
		.filter((resource): resource is NonNullable<typeof resource> => resource !== null);
}

function readNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

function readString(value: unknown): string | null {
	return typeof value === "string" && value.trim() ? value : null;
}

export const mapDiceStringToFormula = (input: string): Formula => {
    const entries: FormulaEntry[] = [];
    const tokens = input.replace(/\s+/g, '').replace(/-/g, '+-').split(/\+/).filter(t => t !== '');
    let currentEntry: FormulaEntry | null = null;
    let currentBonus = 0;
    const validDiceValues = Object.values(Dice).filter((v): v is number => typeof v === 'number');

    for (const token of tokens) {
        const diceMatch = token.match(/^(\d*)[кd](\d+)$/i);
        if (diceMatch) {
            if (currentEntry !== null) {
                entries.push({ ...currentEntry, bonus: currentBonus });
                currentBonus = 0;
            }
            const dicesCount = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
            const diceValue = parseInt(diceMatch[2], 10);
            
            if (validDiceValues.includes(diceValue)) {
                currentEntry = {
                    dice: diceValue,
                    dicesCount: dicesCount,
                    bonus: 0,
                };
            } else {
                currentEntry = null;
            }
        } else {
            const bonus = parseInt(token, 10);
            if (!isNaN(bonus)) {
                currentBonus += bonus;
            }
        }
    }

    if (currentEntry !== null) {
        entries.push({ ...currentEntry, bonus: currentBonus });
    }

    return { entries };
};

export const mapDiceRollerTags = (input: string): string => {
    return input.replace(
        /<dice-roller\s+([^>]*?)\s*(?:\/>|>(\s*)<\/dice-roller>)/g,
        (match, attributes) => {
            const labelMatch = attributes.match(/label="([^"]*)"/);
            const formulaMatch = attributes.match(/formula="([^"]*)"/);
            if (!formulaMatch) return match;
            const formula = formulaMatch[1];
            if (labelMatch) {
                return `<dice-roller ${attributes}>${formula}</dice-roller>`;
            } else {
                return `<dice-roller label="Бросок" ${attributes}>${formula}</dice-roller>`;
            }
        }
    );
};
