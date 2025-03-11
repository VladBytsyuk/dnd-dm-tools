import { mapDiceStringToFormula } from "./mappers"

export enum Dice {
    d4 = 4,
    d6 = 6,
    d8 = 8,
    d10 = 10,
    d12 = 12,
    d20 = 20,
    d100 = 100,
}

export interface Formula {
    entries: FormulaEntry[],
}

export interface FormulaEntry {
    dice: Dice,
    dicesCount: number,
    bonus: number,
}

export const d4 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d4, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d6 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d6, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d8 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d8, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d10 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d10, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d12 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d12, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d20 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d20, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const d100 = (count: number = 1) => (bonus: number = 0): FormulaEntry => {
    return { dice: Dice.d100, dicesCount: count, bonus: bonus } as FormulaEntry
}

export const formula = (...entries: FormulaEntry[]) => {
    return { entries: entries } as Formula;
}

const diceRoll = (dice: Dice) => {
    return Math.floor(Math.random() * dice) + 1;
}

const entryRoll = (entry: FormulaEntry) => {
    return Array(entry.dicesCount).fill(0).reduce((acc) => acc + diceRoll(entry.dice), 0) + entry.bonus;
}

export const roll = (...entries: FormulaEntry[]) => {
    const formula = { entries: entries } as Formula;
    return formula.entries.reduce((acc, value) => acc + entryRoll(value), 0);
}

export const rollRaw = (input: string): number => {
    const normalizedInput = input.replace(/undefined/gi, "");
    const formula = mapDiceStringToFormula(normalizedInput);
    return formula.entries.reduce((acc, value) => acc + entryRoll(value), 0);
}
