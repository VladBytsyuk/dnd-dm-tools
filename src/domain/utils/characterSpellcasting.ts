import type { ClassEntry } from "src/domain/models/character/ClassEntry";
import type { SpellcastingAbilityCode } from "src/domain/models/character/CharacterSpellbook";

export interface SpellSlotProgression {
	slots: Record<number, number>;
	pact: {
		slotLevel: number;
		slotCount: number;
	} | null;
}

export type PreparedSpellStats = Record<Exclude<SpellcastingAbilityCode, "">, { modifier: number }>;

const STANDARD_SLOTS: Record<number, number[]> = {
	0: [0, 0, 0, 0, 0, 0, 0, 0, 0],
	1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
	2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
	3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
	4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
	5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
	6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
	7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
	8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
	9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
	10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
	11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
	12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
	13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
	14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
	15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
	16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
	17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
	18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
	19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
	20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

const WARLOCK_PACT: Record<number, { slotLevel: number; slotCount: number }> = {
	1: { slotLevel: 1, slotCount: 1 },
	2: { slotLevel: 1, slotCount: 2 },
	3: { slotLevel: 2, slotCount: 2 },
	4: { slotLevel: 2, slotCount: 2 },
	5: { slotLevel: 3, slotCount: 2 },
	6: { slotLevel: 3, slotCount: 2 },
	7: { slotLevel: 4, slotCount: 2 },
	8: { slotLevel: 4, slotCount: 2 },
	9: { slotLevel: 5, slotCount: 2 },
	10: { slotLevel: 5, slotCount: 2 },
	11: { slotLevel: 5, slotCount: 3 },
	12: { slotLevel: 5, slotCount: 3 },
	13: { slotLevel: 5, slotCount: 3 },
	14: { slotLevel: 5, slotCount: 3 },
	15: { slotLevel: 5, slotCount: 3 },
	16: { slotLevel: 5, slotCount: 3 },
	17: { slotLevel: 5, slotCount: 4 },
	18: { slotLevel: 5, slotCount: 4 },
	19: { slotLevel: 5, slotCount: 4 },
	20: { slotLevel: 5, slotCount: 4 },
};

type CasterKind = "full" | "half-down" | "half-up" | "third-down" | "warlock" | "none";

export function calculateSpellSlotProgression(classes: ClassEntry[]): SpellSlotProgression {
	let casterLevel = 0;
	let warlockLevel = 0;

	for (const classEntry of classes) {
		const level = Math.max(0, Math.min(20, classEntry.level || 0));
		const casterKind = resolveCasterKind(classEntry.className, classEntry.subclassName);
		switch (casterKind) {
			case "full":
				casterLevel += level;
				break;
			case "half-down":
				casterLevel += Math.floor(level / 2);
				break;
			case "half-up":
				casterLevel += Math.ceil(level / 2);
				break;
			case "third-down":
				casterLevel += Math.floor(level / 3);
				break;
			case "warlock":
				warlockLevel += level;
				break;
			case "none":
				break;
		}
	}

	const normalizedCasterLevel = Math.max(0, Math.min(20, casterLevel));
	const slotRow = STANDARD_SLOTS[normalizedCasterLevel] ?? STANDARD_SLOTS[0];
	const slots = Object.fromEntries(
		slotRow.map((count, index) => [index + 1, count])
	) as Record<number, number>;

	return {
		slots,
		pact: warlockLevel > 0 ? WARLOCK_PACT[warlockLevel] ?? null : null,
	};
}

export function calculatePreparedSpellLimit(
	classes: ClassEntry[],
	baseAbilityCode: SpellcastingAbilityCode,
	stats: PreparedSpellStats
): number | null {
	const abilityModifier = baseAbilityCode ? (stats[baseAbilityCode]?.modifier ?? 0) : 0;
	let limit = 0;
	let hasPreparedCaster = false;

	for (const classEntry of classes) {
		const classLimit = getPreparedSpellLimitForClass(classEntry, abilityModifier);
		if (classLimit === null) {
			continue;
		}
		hasPreparedCaster = true;
		limit += classLimit;
	}

	return hasPreparedCaster ? Math.max(1, limit) : null;
}

function resolveCasterKind(className: string, subclassName?: string): CasterKind {
	const normalized = normalizeClassName(className);
	const normalizedSubclass = normalizeClassName(subclassName ?? "");
	switch (normalized) {
		case "bard":
		case "бард":
		case "cleric":
		case "жрец":
		case "druid":
		case "друид":
		case "sorcerer":
		case "чародей":
		case "wizard":
		case "волшебник":
			return "full";
		case "paladin":
		case "паладин":
		case "ranger":
		case "следопыт":
			return "half-down";
		case "artificer":
		case "изобретатель":
			return "half-up";
		case "fighter":
		case "воин":
			return isEldritchKnight(normalizedSubclass) ? "third-down" : "none";
		case "rogue":
		case "плут":
			return isArcaneTrickster(normalizedSubclass) ? "third-down" : "none";
		case "warlock":
		case "колдун":
			return "warlock";
		default:
			return "none";
	}
}

function getPreparedSpellLimitForClass(
	classEntry: ClassEntry,
	abilityModifier: number
): number | null {
	const normalized = normalizeClassName(classEntry.className);
	const level = Math.max(0, Math.min(20, classEntry.level || 0));

	switch (normalized) {
		case "cleric":
		case "жрец":
		case "druid":
		case "друид":
		case "wizard":
		case "волшебник":
			return Math.max(1, level + abilityModifier);
		case "paladin":
		case "паладин":
			return Math.max(1, Math.floor(level / 2) + abilityModifier);
		case "artificer":
		case "изобретатель":
			return Math.max(1, Math.floor(level / 2) + abilityModifier);
		default:
			return null;
	}
}

function normalizeClassName(value: string): string {
	return value.trim().toLowerCase();
}

function isEldritchKnight(subclassName: string): boolean {
	return subclassName === "eldritch knight" || subclassName === "мистический рыцарь";
}

function isArcaneTrickster(subclassName: string): boolean {
	return subclassName === "arcane trickster" || subclassName === "магический трикстер";
}
