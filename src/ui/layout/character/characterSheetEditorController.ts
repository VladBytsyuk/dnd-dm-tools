import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
import type { CharacterData } from "../../../domain/models/character/CharacterData";
import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
import type { CharacterCoins, EquipmentItem, WeaponItem, AttunementItem } from "../../../domain/models/character/CharacterEquipment";
import type { CharacterTextSections, EditorNode, TextField } from "../../../domain/models/character/CharacterText";
import type { CharacterSubInfo } from "../../../domain/models/character/CharacterInfo";
import type { CharacterProficiencies } from "../../../domain/models/character/CharacterProficiencies";
import type { CharacterSpellbookState } from "../../../domain/models/character/CharacterSpellbook";
import type { CharacterVitality } from "../../../domain/models/character/CharacterVitality";
import type {
	CharacterEditorEquipmentChange,
	CharacterEditorProficienciesChange,
	CharacterEditorSpellbookChange,
	CharacterEditorTextSection,
	CharacterEditorVitalityChange,
	CharacterSheetPersistence,
	CharacterSubInfoField,
} from "../../../data/repositories/characterSheetTypes";
import { canSafelyEditAsPlainText, createTextFieldFromPlainText } from "./kit/characterTextBlockUtils";
import { createEmptyCharacterSubInfo, ensureCharacterSubInfo } from "./kit/characterSubInfoUtils";

type TimeoutHandle = ReturnType<typeof setTimeout>;

type CharacterSheetEditorControllerOptions = {
	repository?: CharacterSheetPersistence;
	debounceMs?: number;
	onSavingChange?: (isSaving: boolean) => void;
	setTimeoutFn?: typeof setTimeout;
	clearTimeoutFn?: typeof clearTimeout;
	uuidFn?: () => string;
};

export class CharacterSheetEditorController {
	private currentItem: FullCharacterSheet | null = null;
	private saveTimeout: TimeoutHandle | null = null;
	private readonly debounceMs: number;
	private readonly setTimeoutFn: typeof setTimeout;
	private readonly clearTimeoutFn: typeof clearTimeout;
	private readonly uuidFn: () => string;

	constructor(private readonly options: CharacterSheetEditorControllerOptions = {}) {
		this.debounceMs = options.debounceMs ?? 1000;
		this.setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout.bind(globalThis);
		this.clearTimeoutFn = options.clearTimeoutFn ?? globalThis.clearTimeout.bind(globalThis);
		this.uuidFn = options.uuidFn ?? (() => crypto.randomUUID());
	}

	bind(item: FullCharacterSheet): void {
		this.currentItem = item;
	}

	destroy(): void {
		if (this.saveTimeout) {
			this.clearTimeoutFn(this.saveTimeout);
			this.saveTimeout = null;
		}
	}

	getData(): CharacterData {
		return this.getCurrentItem().data;
	}

	applyLegacyMigrations(): boolean {
		const data = this.getData();
		let changed = false;

		changed = migrateToMulticlass(data) || changed;
		changed = migrateEquipmentList(data, this.uuidFn) || changed;
		changed = migrateLegacyProficiencies(data) || changed;

		if (changed && this.options.repository) {
			this.debouncedSave(this.getCurrentItem());
		}

		return changed;
	}

	updateName(newName: string): void {
		const item = this.getCurrentItem();
		item.data.name.value = newName;
		item.name.rus = newName;
		item.name.eng = newName;
		this.debouncedSave(item);
	}

	updateClasses(newClasses: ClassEntry[]): void {
		if (newClasses.length === 0) return;
		const totalLevel = newClasses.reduce((sum, entry) => sum + (entry.level || 0), 0);
		if (totalLevel > 20) return;
		if (newClasses.some((entry) => !entry.level || entry.level < 1 || entry.level > 20)) return;

		const item = this.getCurrentItem();
		const data = item.data;
		data.info.classes = data.info.classes || { name: "classes", value: [] };
		data.info.classes.value = newClasses;
		data.info.charClass.value = newClasses[0].className;
		data.info.charSubclass.value = newClasses[0].subclassName || "";
		item.charClass = newClasses[0].className;
		data.info.level.value = totalLevel;
		item.level = totalLevel;
		this.debouncedSave(item);
	}

	updateRace(newRace: string): void {
		const item = this.getCurrentItem();
		item.data.info.race.value = newRace;
		item.race = newRace;
		this.debouncedSave(item);
	}

	updateBackground(newBackground: string): void {
		const item = this.getCurrentItem();
		item.data.info.background.value = newBackground;
		this.debouncedSave(item);
	}

	updatePlayerName(newPlayerName: string): void {
		const item = this.getCurrentItem();
		item.data.info.playerName.value = newPlayerName;
		item.playerName = newPlayerName;
		this.debouncedSave(item);
	}

	updateAlignment(newAlignment: string): void {
		const item = this.getCurrentItem();
		item.data.info.alignment.value = newAlignment;
		this.debouncedSave(item);
	}

	addExperience(additionalXp: number): void {
		const item = this.getCurrentItem();
		const data = item.data;
		const currentXp = parseInt(data.info.experience.value || "0", 10) || 0;
		data.info.experience.value = (currentXp + additionalXp).toString();
		this.debouncedSave(item);
	}

	updateVitality(change: CharacterEditorVitalityChange): void {
		const item = this.getCurrentItem();
		const data = item.data;
		data.vitality = change.vitality;
		data.conditions = change.conditions;
		this.debouncedSave(item);
	}

	updateWeaponsList(weaponsList: WeaponItem[]): void {
		const item = this.getCurrentItem();
		item.data.weaponsList = weaponsList;
		this.debouncedSave(item);
	}

	updateEquipment(change: CharacterEditorEquipmentChange): void {
		const item = this.getCurrentItem();
		const data = item.data;
		data.coins = change.coins;
		data.equipmentList = change.equipmentList;
		data.text = data.text || ({} as CharacterTextSections);
		data.text.equipment = createTextFieldFromPlainText(change.equipmentText, "equipment-text");
		this.debouncedSave(item);
	}

	updateSubInfo(field: CharacterSubInfoField, value: string): void {
		const item = this.getCurrentItem();
		const data = item.data;
		data.subInfo = ensureCharacterSubInfo(data.subInfo);
		data.subInfo[field] = data.subInfo[field] ?? createEmptyCharacterSubInfo()[field];
		data.subInfo[field].value = value;
		this.debouncedSave(item);
	}

	updateTextSection(section: CharacterEditorTextSection, newText: string): void {
		const item = this.getCurrentItem();
		const data = item.data;
		data.text = data.text || ({} as CharacterTextSections);
		data.text[section] = createTextFieldFromPlainText(newText, `${section}-text`);
		this.debouncedSave(item);
	}

	canEditRoleplaySection(section: CharacterEditorTextSection): boolean {
		return canSafelyEditAsPlainText(this.currentItem?.data.text?.[section]);
	}

	updateProficiencies(newProficiencies: CharacterEditorProficienciesChange): void {
		const item = this.getCurrentItem();
		item.data.proficiencies = newProficiencies;
		this.debouncedSave(item);
	}

	updateSpellbook(newSpellbook: CharacterEditorSpellbookChange): void {
		const item = this.getCurrentItem();
		const data = item.data;
		const baseAbilityCode = newSpellbook.baseAbilityCode;
		const baseAbilityModifier = baseAbilityCode
			? data.stats?.[baseAbilityCode]?.modifier ?? Math.floor(((data.stats?.[baseAbilityCode]?.score ?? 10) - 10) / 2)
			: 0;
		const calculatedSaveDc = 8 + (data.proficiency || 0) + baseAbilityModifier;
		const calculatedAttackBonus = (data.proficiency || 0) + baseAbilityModifier;

		data.spells = newSpellbook;
		data.spellsInfo.base.code = newSpellbook.baseAbilityCode;
		data.spellsInfo.base.value = newSpellbook.baseAbilityCode;
		data.spellsInfo.save.value = (newSpellbook.saveDcOverride ?? calculatedSaveDc).toString();
		data.spellsInfo.mod.value = (newSpellbook.attackBonusOverride ?? calculatedAttackBonus).toString();
		this.debouncedSave(item);
	}

	private getCurrentItem(): FullCharacterSheet {
		if (!this.currentItem) {
			throw new Error("CharacterSheetEditorController used before binding a character sheet");
		}

		return this.currentItem;
	}

	private debouncedSave(itemToSave: FullCharacterSheet): void {
		if (!this.options.repository) return;
		if (this.saveTimeout) {
			this.clearTimeoutFn(this.saveTimeout);
		}

		this.saveTimeout = this.setTimeoutFn(async () => {
			this.options.onSavingChange?.(true);
			try {
				await this.options.repository?.putItem(itemToSave);
			} finally {
				this.options.onSavingChange?.(false);
			}
		}, this.debounceMs);
	}
}

export function migrateToMulticlass(data: CharacterData): boolean {
	if (data.info?.classes && data.info.classes.value.length > 0) {
		return false;
	}

	const legacyClass = data.info?.charClass?.value || "";
	const legacySubclass = data.info?.charSubclass?.value || "";
	const legacyLevel = data.info?.level?.value || 1;

	data.info.classes = {
		name: "classes",
		value: legacyClass
			? [{ className: legacyClass, subclassName: legacySubclass || undefined, level: legacyLevel }]
			: [],
	};
	return true;
}

export function migrateEquipmentList(data: CharacterData, uuidFn: () => string): boolean {
	if (data.equipmentList) {
		return false;
	}

	if (data.attunementsList?.length) {
		data.equipmentList = data.attunementsList.map((attunement: AttunementItem): EquipmentItem => ({
			id: uuidFn(),
			name: { value: attunement.value || "" },
			onCharacter: true,
			isMagic: true,
			isAttuned: attunement.checked || false,
			notes: { value: "" },
			notesVisibility: false,
		}));
		return true;
	}

	data.equipmentList = [];
	return true;
}

export function hasMeaningfulProficienciesData(data: CharacterData): boolean {
	const proficiencies = data.proficiencies;
	if (!proficiencies) return false;

	return Boolean(
		proficiencies.armor?.light ||
		proficiencies.armor?.medium ||
		proficiencies.armor?.heavy ||
		proficiencies.armor?.shield ||
		proficiencies.weapons?.value?.trim() ||
		proficiencies.languages?.value?.trim() ||
		proficiencies.tools?.value?.trim() ||
		proficiencies.other?.value?.trim()
	);
}

export function extractLegacyProfText(textField: string | TextField | undefined): string {
	if (!textField) return "";
	if (typeof textField === "string") return textField.trim();

	const lines: string[] = [];
	const visitNode = (node: EditorNode | undefined): string => {
		if (!node || typeof node !== "object") return "";
		if (node.type === "text") return node.text || "";

		const content = Array.isArray(node.content) ? node.content.map(visitNode).join("") : "";
		if (node.type === "paragraph") {
			lines.push(content);
			return "";
		}

		return content;
	};

	visitNode(textField.value?.data as EditorNode);
	return lines.join("\n").trim();
}

export function migrateLegacyProficiencies(data: CharacterData): boolean {
	if (hasMeaningfulProficienciesData(data)) return false;

	const legacyProfText = extractLegacyProfText(data.text?.prof);
	if (!legacyProfText) return false;

	data.proficiencies.other.value = legacyProfText;
	data.text.prof = createTextFieldFromPlainText("", "prof-text");
	return true;
}
