import { calculateModifier } from "./modifier";
import { Dice, rollRaw, type Formula, type FormulaEntry } from "./dice";
import type { FullMonster } from "./models/monster/FullMonster";
import type { EncounterParticipant } from "./models/encounter/EncounterParticipant";

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
        colorHex: "#94a3b8",
    } as EncounterParticipant;
};

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
