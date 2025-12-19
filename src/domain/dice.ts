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

export interface EntryRollTrace {
    entry: FormulaEntry;
    rolls: number[];              // значения на каждой кости
    subtotal: number;             // сумма костей + bonus
    formulaPart: string;          // например "2d6+3"
    resolvedFormulaPart: string;  // например "2d6(4+1)+3"
}


export interface RollTraceResult {
    total: number;
    formula: string;
    resolvedFormula: string;
    entries: EntryRollTrace[];
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

const formatRollForDisplay = (dice: Dice, value: number): string => {
    if (dice === Dice.d20) {
        if (value === 1) return "❗1❗";
        if (value === 20) return "⭐20⭐";
    }
    return String(value);
};

const formatSigned = (n: number): string => {
    if (n === 0) return "";
    return n > 0 ? `+${n}` : `${n}`; // n уже с минусом
};

const stringifyEntry = (e: FormulaEntry): string => {
    // поддержка “чистого бонуса” если dicesCount === 0
    if (e.dicesCount <= 0) return `${e.bonus}`;
    return `${e.dicesCount}d${e.dice}${formatSigned(e.bonus)}`;
};

const stringifyFormula = (formula: Formula): string => {
    // Склеиваем через " + ", затем нормализуем "+ -X" -> "- X"
    // (так проще поддержать отрицательные бонусы/слагаемые, не зная твоего парсера).
    return formula.entries
        .map(stringifyEntry)
        .join(" + ")
        .replace(/\+\s-\s?/g, "- ");
};

const entryRollTrace = (entry: FormulaEntry): EntryRollTrace => {
    const rolls =
        entry.dicesCount > 0
        ? Array.from({ length: entry.dicesCount }, () => diceRoll(entry.dice))
        : [];

    const diceSum = rolls.reduce((acc, v) => acc + v, 0);
    const subtotal = diceSum + entry.bonus;

    const formulaPart = stringifyEntry(entry);

    // Пример: 2d6(4+1)+3 или просто -2 (если dicesCount==0)
    const resolvedRolls = rolls.map((r) => formatRollForDisplay(entry.dice, r));
    const resolvedFormulaPart =
        entry.dicesCount > 0
        ? `${entry.dicesCount}к${entry.dice} (${resolvedRolls.join("+")}) ${formatSigned(entry.bonus)}`
        : `${entry.bonus}`;

    return { entry, rolls, subtotal, formulaPart, resolvedFormulaPart };
};

// ✅ Новый API: трассируемый бросок из entries
export const rollTrace = (...entries: FormulaEntry[]): RollTraceResult => {
    const formula: Formula = { entries };
    const entryTraces = formula.entries.map(entryRollTrace);

    const total = entryTraces.reduce((acc, t) => acc + t.subtotal, 0);

    const formulaStr = stringifyFormula(formula);
    const resolvedFormulaStr = entryTraces
        .map((t) => t.resolvedFormulaPart)
        .join(" + ")
        .replace(/\+\s-\s?/g, "- ");

    return {
        total,
        formula: formulaStr,
        resolvedFormula: resolvedFormulaStr,
        entries: entryTraces,
    };
};

// ✅ Новый API: трассируемый бросок из строки
export const rollRawTrace = (input: string): RollTraceResult => {
    const normalizedInput = input.replace(/undefined/gi, "");
    const formula = mapDiceStringToFormula(normalizedInput);
    // Если хочешь, чтобы formula строка была “как ввёл пользователь”, можешь вернуть normalizedInput,
    // но тогда она не всегда будет соответствовать нормализованной структуре.
    const entryTraces = formula.entries.map(entryRollTrace);

    const total = entryTraces.reduce((acc, t) => acc + t.subtotal, 0);
    const formulaStr = stringifyFormula(formula);
    const resolvedFormulaStr = entryTraces
        .map((t) => t.resolvedFormulaPart)
        .join(" + ")
        .replace(/\+\s-\s?/g, "- ");

    return {
        total,
        formula: formulaStr,
        resolvedFormula: resolvedFormulaStr,
        entries: entryTraces,
    };
};
