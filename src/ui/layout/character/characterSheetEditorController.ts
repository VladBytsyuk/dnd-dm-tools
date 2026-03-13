import type { FullCharacterSheet } from "../../../domain/models/character/FullCharacterSheet";
import type { CharacterData } from "../../../domain/models/character/CharacterData";
import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
import type { EquipmentItem, WeaponItem, AttunementItem } from "../../../domain/models/character/CharacterEquipment";
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
	CharacterSheetSessionState,
	CharacterSubInfoField,
} from "../../../data/repositories/characterSheetTypes";
import { canSafelyEditAsPlainText, createTextFieldFromPlainText } from "./kit/characterTextBlockUtils";
import { createEmptyCharacterSubInfo, ensureCharacterSubInfo } from "./kit/characterSubInfoUtils";

type TimeoutHandle = ReturnType<typeof setTimeout>;

type CharacterSheetEditorControllerOptions = {
	repository?: CharacterSheetPersistence;
	debounceMs?: number;
	onStateChange?: (state: CharacterSheetSessionState) => void;
	setTimeoutFn?: typeof setTimeout;
	clearTimeoutFn?: typeof clearTimeout;
	uuidFn?: () => string;
	cloneFn?: <T>(value: T) => T;
};

const DEFAULT_STATE: CharacterSheetSessionState = {
	activeUrl: null,
	draft: null,
	isDirty: false,
	status: "idle",
	errorMessage: null,
	lastSavedAt: null,
};

export class CharacterSheetEditorController {
	private readonly debounceMs: number;
	private readonly setTimeoutFn: typeof setTimeout;
	private readonly clearTimeoutFn: typeof clearTimeout;
	private readonly uuidFn: () => string;
	private readonly cloneFn: <T>(value: T) => T;
	private saveTimeout: TimeoutHandle | null = null;
	private saveToken = 0;
	private state: CharacterSheetSessionState = { ...DEFAULT_STATE };

	constructor(private readonly options: CharacterSheetEditorControllerOptions = {}) {
		this.debounceMs = options.debounceMs ?? 1000;
		this.setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout.bind(globalThis);
		this.clearTimeoutFn = options.clearTimeoutFn ?? globalThis.clearTimeout.bind(globalThis);
		this.uuidFn = options.uuidFn ?? (() => crypto.randomUUID());
		this.cloneFn =
			options.cloneFn ??
			((value) => cloneCharacterSheetValue(value));
	}

	getState(): CharacterSheetSessionState {
		return this.state;
	}

	open(item: FullCharacterSheet): void {
		this.state = {
			activeUrl: item.url,
			draft: this.cloneFn(item),
			isDirty: false,
			status: "idle",
			errorMessage: null,
			lastSavedAt: this.state.lastSavedAt,
		};
		this.publish();
	}

	destroy(): void {
		if (this.saveTimeout) {
			this.clearTimeoutFn(this.saveTimeout);
			this.saveTimeout = null;
		}
	}

	getData(): CharacterData {
		return this.getDraft().data;
	}

	applyLegacyMigrations(): boolean {
		const data = this.getData();
		let changed = false;

		changed = migrateToMulticlass(data) || changed;
		changed = migrateEquipmentList(data, this.uuidFn) || changed;
		changed = migrateLegacyProficiencies(data) || changed;

		if (changed) {
			this.markDirty();
			this.debouncedSave();
		}

		return changed;
	}

	updateName(newName: string): void {
		const draft = this.getDraft();
		draft.data.name.value = newName;
		draft.name.rus = newName;
		draft.name.eng = newName;
		this.markDirty();
		this.debouncedSave();
	}

	updateClasses(newClasses: ClassEntry[]): void {
		if (newClasses.length === 0) return;
		const totalLevel = newClasses.reduce((sum, entry) => sum + (entry.level || 0), 0);
		if (totalLevel > 20) return;
		if (newClasses.some((entry) => !entry.level || entry.level < 1 || entry.level > 20)) return;

		const draft = this.getDraft();
		const data = draft.data;
		data.info.classes = data.info.classes || { name: "classes", value: [] };
		data.info.classes.value = newClasses;
		data.info.charClass.value = newClasses[0].className;
		data.info.charSubclass.value = newClasses[0].subclassName || "";
		draft.charClass = newClasses[0].className;
		data.info.level.value = totalLevel;
		draft.level = totalLevel;
		this.markDirty();
		this.debouncedSave();
	}

	updateRace(newRace: string): void {
		const draft = this.getDraft();
		draft.data.info.race.value = newRace;
		draft.race = newRace;
		this.markDirty();
		this.debouncedSave();
	}

	updateBackground(newBackground: string): void {
		this.getDraft().data.info.background.value = newBackground;
		this.markDirty();
		this.debouncedSave();
	}

	updatePlayerName(newPlayerName: string): void {
		const draft = this.getDraft();
		draft.data.info.playerName.value = newPlayerName;
		draft.playerName = newPlayerName;
		this.markDirty();
		this.debouncedSave();
	}

	updateAlignment(newAlignment: string): void {
		this.getDraft().data.info.alignment.value = newAlignment;
		this.markDirty();
		this.debouncedSave();
	}

	addExperience(additionalXp: number): void {
		const draft = this.getDraft();
		const currentXp = parseInt(draft.data.info.experience.value || "0", 10) || 0;
		draft.data.info.experience.value = (currentXp + additionalXp).toString();
		this.markDirty();
		this.debouncedSave();
	}

	updateVitality(change: CharacterEditorVitalityChange): void {
		const draft = this.getDraft();
		draft.data.vitality = change.vitality;
		draft.data.conditions = change.conditions;
		this.markDirty();
		this.debouncedSave();
	}

	updateWeaponsList(weaponsList: WeaponItem[]): void {
		this.getDraft().data.weaponsList = weaponsList;
		this.markDirty();
		this.debouncedSave();
	}

	updateEquipment(change: CharacterEditorEquipmentChange): void {
		const draft = this.getDraft();
		const data = draft.data;
		data.coins = change.coins;
		data.equipmentList = change.equipmentList;
		data.text = data.text || ({} as CharacterTextSections);
		data.text.equipment = createTextFieldFromPlainText(change.equipmentText, "equipment-text");
		this.markDirty();
		this.debouncedSave();
	}

	updateSubInfo(field: CharacterSubInfoField, value: string): void {
		const data = this.getDraft().data;
		data.subInfo = ensureCharacterSubInfo(data.subInfo);
		data.subInfo[field] = data.subInfo[field] ?? createEmptyCharacterSubInfo()[field];
		data.subInfo[field].value = value;
		this.markDirty();
		this.debouncedSave();
	}

	updateTextSection(section: CharacterEditorTextSection, newText: string): void {
		const data = this.getDraft().data;
		data.text = data.text || ({} as CharacterTextSections);
		data.text[section] = createTextFieldFromPlainText(newText, `${section}-text`);
		this.markDirty();
		this.debouncedSave();
	}

	canEditRoleplaySection(section: CharacterEditorTextSection): boolean {
		return canSafelyEditAsPlainText(this.state.draft?.data.text?.[section]);
	}

	updateProficiencies(newProficiencies: CharacterEditorProficienciesChange): void {
		this.getDraft().data.proficiencies = newProficiencies;
		this.markDirty();
		this.debouncedSave();
	}

	updateSpellbook(newSpellbook: CharacterEditorSpellbookChange): void {
		const draft = this.getDraft();
		const data = draft.data;
		const baseAbilityCode = newSpellbook.baseAbilityCode;
		const baseAbilityModifier = baseAbilityCode
			? data.stats?.[baseAbilityCode]?.modifier ??
				Math.floor(((data.stats?.[baseAbilityCode]?.score ?? 10) - 10) / 2)
			: 0;
		const calculatedSaveDc = 8 + (data.proficiency || 0) + baseAbilityModifier;
		const calculatedAttackBonus = (data.proficiency || 0) + baseAbilityModifier;

		data.spells = newSpellbook;
		data.spellsInfo.base.code = newSpellbook.baseAbilityCode;
		data.spellsInfo.base.value = newSpellbook.baseAbilityCode;
		data.spellsInfo.save.value = (newSpellbook.saveDcOverride ?? calculatedSaveDc).toString();
		data.spellsInfo.mod.value = (
			newSpellbook.attackBonusOverride ?? calculatedAttackBonus
		).toString();
		this.markDirty();
		this.debouncedSave();
	}

	async saveNow(): Promise<boolean> {
		if (!this.options.repository || !this.state.draft) return false;
		if (this.saveTimeout) {
			this.clearTimeoutFn(this.saveTimeout);
			this.saveTimeout = null;
		}
		return this.persistDraft(this.cloneFn(this.state.draft), ++this.saveToken);
	}

	private getDraft(): FullCharacterSheet {
		if (!this.state.draft) {
			throw new Error("CharacterSheetEditorController used before opening a character sheet");
		}

		return this.state.draft;
	}

	private markDirty(): void {
		this.state = {
			...this.state,
			isDirty: true,
			status: this.state.status === "saving" ? "saving" : "dirty",
			errorMessage: null,
		};
		this.publish();
	}

	private debouncedSave(): void {
		if (!this.options.repository || !this.state.draft) return;
		if (this.saveTimeout) {
			this.clearTimeoutFn(this.saveTimeout);
		}

		const snapshot = this.cloneFn(this.state.draft);
		const token = ++this.saveToken;
		this.state = { ...this.state, status: "saving", errorMessage: null };
		this.publish();

		this.saveTimeout = this.setTimeoutFn(() => {
			this.saveTimeout = null;
			void this.persistDraft(snapshot, token);
		}, this.debounceMs);
	}

	private async persistDraft(snapshot: FullCharacterSheet, token: number): Promise<boolean> {
		if (!this.options.repository) return false;

		try {
			const saved = await this.options.repository.putItem(snapshot);
			if (token !== this.saveToken) return saved;
			if (!saved) {
				this.state = {
					...this.state,
					status: "error",
					errorMessage: "Не удалось сохранить лист персонажа.",
				};
				this.publish();
				return false;
			}

			this.state = {
				...this.state,
				draft: this.cloneFn(snapshot),
				isDirty: false,
				status: "saved",
				errorMessage: null,
				lastSavedAt: Date.now(),
			};
			this.publish();
			return true;
		} catch (error) {
			if (token !== this.saveToken) return false;
			this.state = {
				...this.state,
				status: "error",
				errorMessage:
					error instanceof Error ? error.message : "Не удалось сохранить лист персонажа.",
			};
			this.publish();
			return false;
		}
	}

	private publish(): void {
		this.options.onStateChange?.(this.state);
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

function cloneCharacterSheetValue<T>(value: T): T {
	if (typeof structuredClone === "function") {
		try {
			return structuredClone(value);
		} catch {
			// Fall through to JSON clone for runtime values that include non-cloneable wrappers.
		}
	}

	return JSON.parse(JSON.stringify(value)) as T;
}
