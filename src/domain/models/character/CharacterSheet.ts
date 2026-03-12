import type { CharacterData } from "./CharacterData";
import {
	createEmptyCharacterProficiencies,
	type CharacterArmorProficiencies,
	type CharacterProficiencies,
} from "./CharacterProficiencies";
import {
	createEmptyCharacterSpellbook,
	type CharacterSpellEntry,
	type CharacterSpellLevelState,
	type CharacterSpellPactState,
	type CharacterSpellbookState,
	type SpellLevelKey,
	SPELL_LEVEL_KEYS,
} from "./CharacterSpellbook";

// Disabled UI blocks configuration
export interface DisabledBlocks {
	"info-left": string[];
	"info-right": string[];
	"subinfo-left": string[];
	"subinfo-right": string[];
	"notes-left": string[];
	"notes-right": string[];
	_id: string;
}

// Spells configuration
export interface SpellsConfig {
	mode: string;
	prepared: unknown[];
	book: unknown[];
}

// Root character sheet interface (with stringified data)
export interface CharacterSheet {
	tags: string[];
	disabledBlocks: DisabledBlocks;
	edition: string;
	spells: SpellsConfig;
	data: string; // Raw stringified JSON
	jsonType: "character";
	version: string;
}

// Character sheet with parsed data
export interface CharacterSheetParsed {
	tags: string[];
	disabledBlocks: DisabledBlocks;
	edition: string;
	spells: SpellsConfig;
	data: CharacterData; // Parsed typed object
	jsonType: "character";
	version: string;
}

/**
 * Parse stringified data field into typed CharacterData
 * @param sheet - Character sheet with stringified data
 * @returns Character sheet with parsed typed data
 */
export function parseCharacterData(sheet: CharacterSheet): CharacterSheetParsed {
	const parsedData = JSON.parse(sheet.data) as CharacterData;
	return {
		...sheet,
		data: normalizeCharacterData(parsedData),
	};
}

/**
 * Stringify data field for storage
 * @param sheet - Character sheet with parsed data
 * @returns Character sheet with stringified data
 */
export function stringifyCharacterData(sheet: CharacterSheetParsed): CharacterSheet {
	return {
		...sheet,
		data: JSON.stringify(sheet.data),
	};
}

export function normalizeCharacterData(data: CharacterData): CharacterData {
	return {
		...data,
		proficiencies: normalizeCharacterProficiencies(data.proficiencies),
		spells: normalizeCharacterSpellbook(data),
	};
}

function normalizeCharacterProficiencies(
	proficiencies: CharacterProficiencies | undefined
): CharacterProficiencies {
	const defaults = createEmptyCharacterProficiencies();

	return {
		armor: normalizeArmorProficiencies(proficiencies?.armor, defaults.armor),
		weapons: { value: proficiencies?.weapons?.value ?? "" },
		languages: { value: proficiencies?.languages?.value ?? "" },
		tools: { value: proficiencies?.tools?.value ?? "" },
		other: { value: proficiencies?.other?.value ?? "" },
	};
}

function normalizeArmorProficiencies(
	armor: Partial<CharacterArmorProficiencies> | undefined,
	defaults: CharacterArmorProficiencies
): CharacterArmorProficiencies {
	return {
		light: armor?.light ?? defaults.light,
		medium: armor?.medium ?? defaults.medium,
		heavy: armor?.heavy ?? defaults.heavy,
		shield: armor?.shield ?? defaults.shield,
	};
}

function normalizeCharacterSpellbook(data: CharacterData): CharacterSpellbookState {
	const defaults = createEmptyCharacterSpellbook();
	const legacySpells = data.spells as any;
	const legacyPact = data.spellsPact as any;
	const normalized: CharacterSpellbookState = {
		baseAbilityCode: normalizeAbilityCode(
			legacySpells?.baseAbilityCode ?? data.spellsInfo?.base?.code ?? ""
		),
		saveDcOverride: normalizeOptionalNumber(legacySpells?.saveDcOverride),
		attackBonusOverride: normalizeOptionalNumber(legacySpells?.attackBonusOverride),
		preparedSpellLimitOverride: normalizeOptionalNumber(
			legacySpells?.preparedSpellLimitOverride
		),
		levels: { ...defaults.levels },
		pact: normalizePactState(legacySpells?.pact ?? legacyPact),
	};

	for (const levelKey of SPELL_LEVEL_KEYS) {
		const level = parseInt(levelKey, 10);
		const rawLevel = legacySpells?.levels?.[levelKey];
		const slotFallback = level > 0 ? legacySpells?.[`slots-${level}`] : undefined;
		const legacyText = readLegacySpellText(data, level);
		normalized.levels[levelKey] = normalizeSpellLevelState(level, rawLevel, slotFallback, legacyText);
	}

	return normalized;
}

function normalizeSpellLevelState(
	level: number,
	rawLevel: any,
	slotFallback: unknown,
	legacyText: string
): CharacterSpellLevelState {
	const slotCountOverride = normalizeOptionalNumber(rawLevel?.slotCountOverride ?? slotFallback);
	const slotsUsed = normalizeSlotsUsed(rawLevel?.slotsUsed, slotCountOverride ?? 0);
	const spells = normalizeSpellEntries(rawLevel?.spells, level, legacyText);

	return {
		level,
		slotCountOverride,
		slotsUsed,
		spells,
	};
}

function normalizeSpellEntries(rawEntries: unknown, level: number, legacyText: string): CharacterSpellEntry[] {
	if (Array.isArray(rawEntries)) {
		return rawEntries
			.map((entry, index) => normalizeSpellEntry(entry, level, index))
			.filter((entry): entry is CharacterSpellEntry => entry !== null);
	}

	if (!legacyText.trim()) {
		return [];
	}

	return legacyText
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((name, index) => ({
			id: `legacy-${level}-${index}-${slugifySpellName(name)}`,
			name,
			level,
			preparationState: "none" as const,
		}));
}

function normalizeSpellEntry(rawEntry: unknown, level: number, index: number): CharacterSpellEntry | null {
	if (!rawEntry || typeof rawEntry !== "object") {
		return null;
	}

	const candidate = rawEntry as Record<string, unknown>;
	const name = typeof candidate.name === "string"
		? candidate.name
		: typeof candidate.title === "string"
			? candidate.title
			: "";

	if (!name.trim()) {
		return null;
	}

	const linkedSpellUrl = typeof candidate.linkedSpellUrl === "string"
		? candidate.linkedSpellUrl
		: typeof candidate.url === "string"
			? candidate.url
			: undefined;

	return {
		id: typeof candidate.id === "string" && candidate.id.trim()
			? candidate.id
			: `spell-${level}-${index}-${slugifySpellName(name)}`,
		name,
		level: normalizeOptionalNumber(candidate.level) ?? level,
		preparationState: normalizePreparationState(candidate.preparationState, candidate.prepared),
		...(linkedSpellUrl ? { linkedSpellUrl } : {}),
	};
}

function normalizePactState(rawPact: any): CharacterSpellPactState | null {
	if (!rawPact || typeof rawPact !== "object") {
		return null;
	}

	const slotLevel = normalizeOptionalNumber(
		rawPact.slotLevel ?? rawPact.level ?? rawPact["slot-level"]
	) ?? 1;
	const slotCountOverride = normalizeOptionalNumber(
		rawPact.slotCountOverride ?? rawPact.slotCount ?? rawPact.slots ?? rawPact.count
	);
	return {
		slotLevel,
		slotCountOverride,
		slotsUsed: normalizeSlotsUsed(rawPact.slotsUsed ?? rawPact.used ?? rawPact.state, slotCountOverride ?? 0),
	};
}

function normalizeSlotsUsed(rawSlotsUsed: unknown, fallbackLength: number): boolean[] {
	if (Array.isArray(rawSlotsUsed)) {
		return rawSlotsUsed.map(Boolean);
	}

	if (!fallbackLength || fallbackLength < 1) {
		return [];
	}

	return Array.from({ length: fallbackLength }, () => false);
}

function readLegacySpellText(data: CharacterData, level: number): string {
	const legacyText = (data.text as unknown as Record<string, unknown> | undefined)?.[`spells-level-${level}`];
	if (!legacyText) {
		return "";
	}
	if (typeof legacyText === "string") {
		return legacyText.trim();
	}
	if (typeof legacyText !== "object") {
		return "";
	}

	const lines: string[] = [];
	const visitNode = (node: any): string => {
		if (!node || typeof node !== "object") return "";
		if (node.type === "text") return node.text || "";

		const content = Array.isArray(node.content) ? node.content.map(visitNode).join("") : "";
		if (node.type === "paragraph") {
			if (content.trim()) {
				lines.push(content.trim());
			}
			return "";
		}

		return content;
	};

	visitNode((legacyText as any).value?.data);
	return lines.join("\n").trim();
}

function normalizeAbilityCode(value: unknown): CharacterSpellbookState["baseAbilityCode"] {
	const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
	switch (normalized) {
		case "str":
		case "dex":
		case "con":
		case "int":
		case "wis":
		case "cha":
			return normalized;
		default:
			return "";
	}
}

function normalizeOptionalNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = parseInt(value, 10);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}

function normalizePreparationState(
	preparationState: unknown,
	legacyPrepared: unknown
): "none" | "prepared" | "always" {
	if (preparationState === "none" || preparationState === "prepared" || preparationState === "always") {
		return preparationState;
	}
	return legacyPrepared ? "prepared" : "none";
}

function slugifySpellName(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-zа-я0-9-]/gi, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}
