import type { FullMonster } from "./monster"
import type { EncounterParticipant } from "./encounter"
import { calculateModifier } from "./modifier";
import { randomSpeciality } from "src/res/texts_ru";
import { Dice, rollRaw, type Formula, type FormulaEntry } from "./dice";

export const monsterToEncounterParticipant = (monster: FullMonster): EncounterParticipant => {
    const speciality = randomSpeciality()
    const newName = speciality ? `${monster.name.rus} (${speciality})` : monster.name.rus
    const rolledHp = rollRaw(`${monster.hits.formula}${monster.hits.sign}${monster.hits.bonus}`)
    return {
        id: Date.now(),
        imageUrl: monster.images.first(),
        initiative: 0,
        initiativeModifier: calculateModifier(monster.ability.dex),
        name: newName,
        hpCurrent: rolledHp,
        hpTemporary: 0,
        hpMax: rolledHp,
        armorClass: monster.armorClass,
    } as EncounterParticipant;
};

export const diceToFormula = (input: string): Formula => {
    const entries: FormulaEntry[] = [];
    const tokens = input.replace(/\s+/g, '').split(/\+/).filter(t => t !== '');
    let currentEntry: FormulaEntry | null = null;
    let currentBonus = 0;
    const validDiceValues = Object.values(Dice).filter((v): v is number => typeof v === 'number');

    for (const token of tokens) {
        const diceMatch = token.match(/^(\d*)к(\d+)$/i);
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

export const transformDiceRollerTags = (input: string): string => {
    return input.replace(
        /<dice-roller\s+([^>]*?)\s*(?:\/>|>(\s*)<\/dice-roller>)/g,
        (match, attributes) => {
            const labelMatch = attributes.match(/label="([^"]*)"/);
            const formulaMatch = attributes.match(/formula="([^"]*)"/);
            if (!labelMatch || !formulaMatch) return match;
            const formula = formulaMatch[1];
            return `<dice-roller ${attributes}>${formula}</dice-roller>`;
        }
    );
};
