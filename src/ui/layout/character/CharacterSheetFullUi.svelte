<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullCharacterSheet } from "../../../domain/models/character";
	import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
	import type { CharacterCoins } from "../../../domain/models/character/CharacterEquipment";
	import type { CharacterTextSections } from "../../../domain/models/character/CharacterText";
	import { EntityLinkService } from "../../../domain/services/EntityLinkService";
	import type DndStatblockPlugin from "../../../main";
	import type { SmallRace } from "../../../domain/models/race/SmallRace";
	import type { SmallBackground } from "../../../domain/models/background/SmallBackground";
	import type { SmallClass } from "../../../domain/models/class/SmallClass";
	import type { SmallItem } from "../../../domain/models/items/SmallItem";
	import type { SmallArtifact } from "../../../domain/models/artifact/SmallArtifact";
	import type { SmallArmor } from "../../../domain/models/armor/SmallArmor";
	import type { SmallSpell } from "../../../domain/models/spell/SmallSpell";
	import type { EquipmentAutocompleteItem } from "./kit/characterEquipmentUtils";

	// Import kit components
	import CharacterHeader from "./kit/CharacterHeader.svelte";
	import CharacterAbilityGroup from "./kit/CharacterAbilityGroup.svelte";
	import CharacterVitalityBlock from "./kit/CharacterVitalityBlock.svelte";
	import CharacterCombatBlock from "./kit/CharacterCombatBlock.svelte";
	import CharacterSpellbook from "./kit/CharacterSpellbook.svelte";
	import CharacterEquipmentBlock from "./kit/CharacterEquipmentBlock.svelte";
	import CharacterTextSection from "./kit/CharacterTextSection.svelte";
	import CharacterEditableTextBlock from "./kit/CharacterEditableTextBlock.svelte";
	import CharacterEditableInfoField from "./kit/CharacterEditableInfoField.svelte";
	import CharacterProficienciesBlock from "./kit/CharacterProficienciesBlock.svelte";
	import { canSafelyEditAsPlainText, createTextFieldFromPlainText } from "./kit/characterTextBlockUtils";
	import { createEmptyCharacterSubInfo, ensureCharacterSubInfo } from "./kit/characterSubInfoUtils";
	import type { CharacterSubInfo } from "../../../domain/models/character/CharacterInfo";

	let {
		currentItem,
		uiEventListener,
		repository,
		plugin,
	} = $props<{
		currentItem: FullCharacterSheet;
		uiEventListener: IUiEventListener;
		repository?: CharacterSheetRepository;
		plugin?: DndStatblockPlugin;
	}>();

	const diceRollersManager = DiceRollersManager.create(uiEventListener);
	onMount(async () => {
		await tick();
		diceRollersManager.onMount();
	});
	onDestroy(() => {
		diceRollersManager.onDestroy();
	});

	let data = $derived(currentItem.data);

	$effect(() => {
		currentItem.url;
		migrateToMulticlass();
		migrateEquipmentList();
		migrateLegacyProficiencies();
	});

	// Create EntityLinkService if repository is available
	const entityLinkService = $derived(
		repository ? new EntityLinkService(repository.getDatabase()) : undefined
	);

	// Autocomplete data state
	let raceOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let backgroundOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let classOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let archetypeOptions = $state<Array<{ name: { rus: string; eng: string }; url: string; parentClassUrl: string }>>([]);
	let equipmentAutocompleteItems = $state<EquipmentAutocompleteItem[]>([]);
	let spellAutocompleteItems = $state<Array<{ name: { rus: string; eng: string }; url: string; level: number }>>([]);

	// Fetch autocomplete data from database
	$effect(() => {
		if (repository) {
			const database = repository.getDatabase();

			// Fetch all autocomplete data in parallel with error handling
			Promise.all([
				database.smallRaceDao.readAllItems(null, null),
				database.smallBackgroundDao.readAllItems(null, null),
				database.smallClassDao.readAllItems(null, null),
				database.smallItemDao.readAllItems(null, null),
				database.smallArtifactDao.readAllItems(null, null),
				database.smallArmorDao.readAllItems(null, null),
				database.smallSpellDao.readAllItems(null, null)
			])
				.then(([races, backgrounds, classes, items, artifacts, armor, spells]) => {
					// Map races
					raceOptions = races.map((r: SmallRace) => ({
						name: r.name,
						url: r.url
					}));

					// Map backgrounds
					backgroundOptions = backgrounds.map((b: SmallBackground) => ({
						name: b.name,
						url: b.url
					}));

					// Map classes (filter out archetypes)
					classOptions = classes
						.filter((c: SmallClass) => !c.isArchetype)
						.map((c: SmallClass) => ({
							name: c.name,
							url: c.url
						}));

					// Map archetypes (subclasses)
					archetypeOptions = classes
						.filter((c: SmallClass) => c.isArchetype)
						.map((c: SmallClass) => ({
							name: c.name,
							url: c.url,
							parentClassUrl: c.parentClassUrl || ''
						}));

					equipmentAutocompleteItems = [
						...items.map((item: SmallItem) => ({
							name: item.name,
							url: item.url,
							linkedType: 'item' as const
						})),
						...artifacts.map((artifact: SmallArtifact) => ({
							name: artifact.name,
							url: artifact.url,
							linkedType: 'artifact' as const
						})),
						...armor.map((armorItem: SmallArmor) => ({
							name: armorItem.name,
							url: armorItem.url,
							linkedType: 'armor' as const
						}))
					];

					spellAutocompleteItems = spells.map((spell: SmallSpell) => ({
						name: spell.name,
						url: spell.url,
						level: spell.level
					}));
				})
				.catch((error) => {
					console.error('Failed to load autocomplete data:', error);
					// Set empty arrays as fallback to allow component to function
					raceOptions = [];
					backgroundOptions = [];
					classOptions = [];
					archetypeOptions = [];
					equipmentAutocompleteItems = [];
					spellAutocompleteItems = [];
				});
		}
	});

	// Migration logic: Convert old single-class format to new multiclass format
	function migrateToMulticlass() {
		if (!data.info?.classes || data.info.classes.value.length === 0) {
			const legacyClass = data.info?.charClass?.value || '';
			const legacySubclass = data.info?.charSubclass?.value || '';
			const legacyLevel = data.info?.level?.value || 1;

			if (legacyClass) {
				data.info.classes = {
					name: 'classes',
					value: [{
						className: legacyClass,
						subclassName: legacySubclass || undefined,
						level: legacyLevel
					}]
				};
			} else {
				// No class at all, create empty array
				data.info.classes = {
					name: 'classes',
					value: []
				};
			}
		}
	}

	// Migrate old attunementsList to new equipmentList structure
	function migrateEquipmentList() {
		if (!data.equipmentList && data.attunementsList?.length > 0) {
			data.equipmentList = data.attunementsList.map((att: any) => ({
				id: crypto.randomUUID(),
				name: { value: att.value || '' },
				onCharacter: true,
				isMagic: true,
				isAttuned: att.checked || false,
				notes: { value: '' },
				notesVisibility: false
			}));
			// Save the migration
			if (repository) {
				debouncedSave();
			}
		} else if (!data.equipmentList) {
			// Initialize empty equipment list
			data.equipmentList = [];
		}
	}

	function hasMeaningfulProficienciesData() {
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

	function extractLegacyProfText(): string {
		const legacyProf = data.text?.prof;
		if (!legacyProf) return "";
		if (typeof legacyProf === "string") return legacyProf.trim();

		const lines: string[] = [];

		const visitNode = (node: any): string => {
			if (!node || typeof node !== "object") return "";
			if (node.type === "text") return node.text || "";

			const content = Array.isArray(node.content) ? node.content.map(visitNode).join("") : "";
			if (node.type === "paragraph") {
				lines.push(content);
				return "";
			}

			return content;
		};

		visitNode(legacyProf.value?.data);
		return lines.join("\n").trim();
	}

	function migrateLegacyProficiencies() {
		if (hasMeaningfulProficienciesData()) return;

		const legacyProfText = extractLegacyProfText();
		if (!legacyProfText) return;

		data.proficiencies.other.value = legacyProfText;
		data.text.prof = createTextFieldFromPlainText("", "prof-text");
		if (repository) {
			debouncedSave();
		}
	}

	// Auto-save functionality
	let saveTimeout: NodeJS.Timeout | null = null;
	let isSaving = $state(false);

	async function debouncedSave(itemToSave: FullCharacterSheet = currentItem) {
		if (!repository) return;

		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			isSaving = true;
			try {
				await repository.putItem(itemToSave);
				console.log('Character saved');
			} catch (error) {
				console.error('Failed to save character:', error);
			} finally {
				isSaving = false;
			}
		}, 1000); // 1 second debounce
	}

	// Event handlers for character header
	function handleNameChange(newName: string) {
		data.name.value = newName;
		currentItem.name.rus = newName;
		currentItem.name.eng = newName;
		debouncedSave();
	}

	function handleClassesChange(newClasses: ClassEntry[]) {
		// Validation: at least one class required
		if (newClasses.length === 0) return;

		// Validation: total level cannot exceed 20
		const totalLevel = newClasses.reduce((sum, c) => sum + (c.level || 0), 0);
		if (totalLevel > 20) return;

		// Validation: each class level must be 1-20
		const invalidLevel = newClasses.some(c => !c.level || c.level < 1 || c.level > 20);
		if (invalidLevel) return;

		// Update multiclass array
		data.info.classes.value = newClasses;

		// Update legacy fields for backward compatibility
		if (newClasses.length > 0) {
			data.info.charClass.value = newClasses[0].className;
			data.info.charSubclass.value = newClasses[0].subclassName || '';
			currentItem.charClass = newClasses[0].className;
		}

		// Update total level
		data.info.level.value = totalLevel;
		currentItem.level = totalLevel;

		debouncedSave();
	}

	function handleRaceChange(newRace: string) {
		data.info.race.value = newRace;
		currentItem.race = newRace;
		debouncedSave();
	}

	function handleBackgroundChange(newBackground: string) {
		data.info.background.value = newBackground;
		debouncedSave();
	}

	function handlePlayerNameChange(newPlayerName: string) {
		data.info.playerName.value = newPlayerName;
		currentItem.playerName = newPlayerName;
		debouncedSave();
	}

	function handleAlignmentChange(newAlignment: string) {
		data.info.alignment.value = newAlignment;
		debouncedSave();
	}

	function handleExperienceAdd(additionalXp: number) {
		const currentXp = parseInt(data.info.experience.value || '0') || 0;
		const newXp = currentXp + additionalXp;
		data.info.experience.value = newXp.toString();
		debouncedSave();
	}

	function handleVitalityChange(newVitality: any, newConditions: string[]) {
		data.vitality = newVitality;
		data.conditions = newConditions;
		debouncedSave();
	}

	function handleWeaponsListChange(newWeaponsList: any[]) {
		data.weaponsList = newWeaponsList;
		debouncedSave();
	}

	function handleEquipmentChange(newCoins: any, newEquipmentList: any[], newEquipmentText: string) {
		data.coins = newCoins;
		data.equipmentList = newEquipmentList;
		data.text = data.text || {};
		data.text.equipment = createTextFieldFromPlainText(newEquipmentText, "equipment-text");
		debouncedSave();
	}

	function ensureSubInfo(): CharacterSubInfo {
		data.subInfo = ensureCharacterSubInfo(data.subInfo);

		return data.subInfo;
	}

	function handleSubInfoChange(field: keyof CharacterSubInfo, value: string) {
		const subInfo = ensureSubInfo();
		subInfo[field] = subInfo[field] ?? createEmptyCharacterSubInfo()[field];
		subInfo[field].value = value;
		debouncedSave();
	}

	function handleTextSectionChange(section: keyof CharacterTextSections, newText: string) {
		data.text = data.text || {};
		data.text[section] = createTextFieldFromPlainText(newText, `${section}-text`);
		debouncedSave();
	}

	function canEditRoleplaySection(section: keyof CharacterTextSections): boolean {
		return canSafelyEditAsPlainText(data.text?.[section]);
	}

	function handleProficienciesChange(newProficiencies: typeof data.proficiencies) {
		data.proficiencies = newProficiencies;
		debouncedSave();
	}

	function handleSpellbookChange(newSpellbook: typeof data.spells) {
		const baseAbilityCode = newSpellbook.baseAbilityCode;
		const baseAbilityModifier = baseAbilityCode ? (data.stats?.[baseAbilityCode]?.modifier ?? Math.floor(((data.stats?.[baseAbilityCode]?.score ?? 10) - 10) / 2)) : 0;
		const calculatedSaveDc = 8 + (data.proficiency || 0) + baseAbilityModifier;
		const calculatedAttackBonus = (data.proficiency || 0) + baseAbilityModifier;

		data.spells = newSpellbook;
		data.spellsInfo.base.code = newSpellbook.baseAbilityCode;
		data.spellsInfo.base.value = newSpellbook.baseAbilityCode;
		data.spellsInfo.save.value = (newSpellbook.saveDcOverride ?? calculatedSaveDc).toString();
		data.spellsInfo.mod.value = (newSpellbook.attackBonusOverride ?? calculatedAttackBonus).toString();
		debouncedSave();
	}

	function handleOpenConditionDetails(url: string) {
		uiEventListener.onScreenItemClick(url);
	}

	// Database lookup wrappers
	async function lookupRace(race: string) {
		return entityLinkService ? await entityLinkService.findRace(race) : { exists: false };
	}

	async function lookupClass(className: string) {
		return entityLinkService ? await entityLinkService.findClass(className) : { exists: false };
	}

	async function lookupSubclass(subclassName: string, parentClassName?: string) {
		return entityLinkService ? await entityLinkService.findArchetype(subclassName, parentClassName) : { exists: false };
	}

	async function lookupBackground(bg: string) {
		return entityLinkService ? await entityLinkService.findBackground(bg) : { exists: false };
	}

	// Transform data for components
	const headerInfo = $derived({
		classes: data.info?.classes?.value || [],
		level: data.info?.level?.value || 1,
		race: data.info?.race?.value || '',
		background: data.info?.background?.value,
		playerName: data.info?.playerName?.value,
		alignment: data.info?.alignment?.value,
		experience: parseInt(data.info?.experience?.value || '0') || 0
	});

	const stats = $derived.by(() => {
		const calculateMod = (score: number) => Math.floor((score - 10) / 2);
		return {
			str: { name: 'str', score: data.stats?.str?.score || 10, modifier: calculateMod(data.stats?.str?.score || 10) },
			dex: { name: 'dex', score: data.stats?.dex?.score || 10, modifier: calculateMod(data.stats?.dex?.score || 10) },
			con: { name: 'con', score: data.stats?.con?.score || 10, modifier: calculateMod(data.stats?.con?.score || 10) },
			int: { name: 'int', score: data.stats?.int?.score || 10, modifier: calculateMod(data.stats?.int?.score || 10) },
			wis: { name: 'wis', score: data.stats?.wis?.score || 10, modifier: calculateMod(data.stats?.wis?.score || 10) },
			cha: { name: 'cha', score: data.stats?.cha?.score || 10, modifier: calculateMod(data.stats?.cha?.score || 10) }
		};
	});

	const saves = $derived({
		str: { name: 'str', isProf: data.saves?.str?.isProf || false },
		dex: { name: 'dex', isProf: data.saves?.dex?.isProf || false },
		con: { name: 'con', isProf: data.saves?.con?.isProf || false },
		int: { name: 'int', isProf: data.saves?.int?.isProf || false },
		wis: { name: 'wis', isProf: data.saves?.wis?.isProf || false },
		cha: { name: 'cha', isProf: data.saves?.cha?.isProf || false }
	});

	const vitality = $derived(data.vitality || {
		"hp-max": { value: 0 },
		"hp-max-bonus": { value: 0 },
		"hit-die": { value: "d8" },
		"hp-dice-current": { value: 0 },
		"hp-dice-multi": {},
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
	});

	const conditions = $derived(data.conditions || []);

	const proficiency = $derived(data.proficiency || 2);

	const weaponsList = $derived(data.weaponsList || []);

	const proficiencies = $derived(data.proficiencies);

	const attunementsList = $derived(
		(data.attunementsList || []).map((a: any) => ({
			value: a.value || '',
			checked: a.checked || false
		}))
	);

	const coins = $derived<CharacterCoins | undefined>(data.coins ? {
		gp: { value: data.coins.gp?.value || 0 },
		sp: { value: data.coins.sp?.value || 0 },
		cp: { value: data.coins.cp?.value || 0 },
		pp: { value: data.coins.pp?.value || 0 },
		ep: { value: data.coins.ep?.value || 0 },
		total: { value: data.coins.total?.value || 0 }
	} : undefined);

	// Ability groups with their associated skills
	const abilityGroups = [
		{
			key: 'str',
			label: 'СИЛ',
			fullName: 'Сила',
			skills: [
				{ key: 'athletics', label: 'Атлетика' }
			]
		},
		{
			key: 'dex',
			label: 'ЛОВ',
			fullName: 'Ловкость',
			skills: [
				{ key: 'acrobatics', label: 'Акробатика' },
				{ key: 'sleight of hand', label: 'Ловкость рук' },
				{ key: 'stealth', label: 'Скрытность' }
			]
		},
		{
			key: 'con',
			label: 'ТЕЛ',
			fullName: 'Телосложение',
			skills: []
		},
		{
			key: 'int',
			label: 'ИНТ',
			fullName: 'Интеллект',
			skills: [
				{ key: 'investigation', label: 'Анализ' },
				{ key: 'history', label: 'История' },
				{ key: 'arcana', label: 'Магия' },
				{ key: 'nature', label: 'Природа' },
				{ key: 'religion', label: 'Религия' }
			]
		},
		{
			key: 'wis',
			label: 'МДР',
			fullName: 'Мудрость',
			skills: [
				{ key: 'perception', label: 'Восприятие' },
				{ key: 'survival', label: 'Выживание' },
				{ key: 'medicine', label: 'Медицина' },
				{ key: 'animal handling', label: 'Обращение с животными' },
				{ key: 'insight', label: 'Проницательность' }
			]
		},
		{
			key: 'cha',
			label: 'ХАР',
			fullName: 'Харизма',
			skills: [
				{ key: 'performance', label: 'Выступление' },
				{ key: 'intimidation', label: 'Запугивание' },
				{ key: 'deception', label: 'Обман' },
				{ key: 'persuasion', label: 'Убеждение' }
			]
		}
	];

</script>

<div class="character-sheet-full">
	<div class="character-sheet-layout">
		<!-- Right Column: Spellcasting, Features, Traits -->
		<div class="column column-right">
			<CharacterSpellbook
				spellbook={data.spells}
				stats={stats}
				classes={data.info.classes?.value || []}
				{proficiency}
				{spellAutocompleteItems}
				{entityLinkService}
				{uiEventListener}
				onChange={handleSpellbookChange}
			/>
		</div>

		<div class="main-stack">
			<div class="main-primary">
			<!-- Left Column: Abilities with Saves and Skills -->
				<div class="column column-left">
					{#each abilityGroups as group}
						<CharacterAbilityGroup
							abilityKey={group.key}
							abilityLabel={group.label}
							abilityFullName={group.fullName}
							stat={stats[group.key as keyof typeof stats]}
							save={saves[group.key as keyof typeof saves]}
							skills={group.skills}
							allSkills={data.skills || {}}
							{proficiency}
						/>
					{/each}

					<CharacterProficienciesBlock
						{proficiencies}
						onChange={handleProficienciesChange}
					/>
				</div>

				<!-- Center Column: Header, Vitality, Combat, Equipment, Description -->
				<div class="column column-center">
					<CharacterHeader
						name={data.name}
						info={headerInfo}
						avatar={data.avatar}
						isDying={vitality.isDying ?? false}
						onNameChange={handleNameChange}
						onClassesChange={handleClassesChange}
						onRaceChange={handleRaceChange}
						onBackgroundChange={handleBackgroundChange}
						onPlayerNameChange={handlePlayerNameChange}
						onAlignmentChange={handleAlignmentChange}
						onExperienceAdd={handleExperienceAdd}
						onLookupRace={lookupRace}
						onLookupClass={lookupClass}
						onLookupSubclass={lookupSubclass}
						onLookupBackground={lookupBackground}
						uiEventListener={uiEventListener}
						{raceOptions}
						{backgroundOptions}
						{classOptions}
						{archetypeOptions}
					/>

					<CharacterVitalityBlock
						{vitality}
						stats={data.stats}
						skills={data.skills}
						{proficiency}
						level={headerInfo.level}
						classes={data.info.classes?.value || []}
						{conditions}
						onChange={handleVitalityChange}
						onOpenConditionDetails={handleOpenConditionDetails}
					/>

					<CharacterCombatBlock
						{weaponsList}
						{stats}
						{proficiency}
						onChange={handleWeaponsListChange}
						{uiEventListener}
					/>

					{#if data.text?.attacks && typeof data.text.attacks === 'string' && data.text.attacks.trim()}
						<CharacterTextSection
							title="Дополнительные атаки и заклинания"
							content={data.text.attacks}
							collapsible={true}
						/>
					{/if}

					<CharacterEquipmentBlock
						{coins}
						equipmentList={data.equipmentList || []}
						equipmentText={data.text?.equipment}
						{equipmentAutocompleteItems}
						{entityLinkService}
						{uiEventListener}
						onChange={handleEquipmentChange}
					/>

					<div class="character-reference-blocks">
						<div class="character-reference-block character-reference-block-half">
							<CharacterEditableTextBlock
								title="Расовые особенности"
								content={data.text?.traits}
								onChange={(value) => handleTextSectionChange("traits", value)}
							/>
						</div>
						<div class="character-reference-block character-reference-block-half">
							<CharacterEditableTextBlock
								title="Черты"
								content={data.text?.feats}
								onChange={(value) => handleTextSectionChange("feats", value)}
							/>
						</div>
						<div class="character-reference-block character-reference-block-full">
							<CharacterEditableTextBlock
								title="Особенности класса"
								content={data.text?.features}
								minHeight="200px"
								onChange={(value) => handleTextSectionChange("features", value)}
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="roleplay-section">
				<div class="roleplay-section-header">
					<h2 class="roleplay-section-title">Ролевая информация</h2>
				</div>

				<div class="roleplay-physical-grid">
					<CharacterEditableInfoField
						label="Возраст"
						value={data.subInfo?.age?.value || ""}
						onChange={(value) => handleSubInfoChange("age", value)}
					/>
					<CharacterEditableInfoField
						label="Рост"
						value={data.subInfo?.height?.value || ""}
						onChange={(value) => handleSubInfoChange("height", value)}
					/>
					<CharacterEditableInfoField
						label="Вес"
						value={data.subInfo?.weight?.value || ""}
						onChange={(value) => handleSubInfoChange("weight", value)}
					/>
					<CharacterEditableInfoField
						label="Глаза"
						value={data.subInfo?.eyes?.value || ""}
						onChange={(value) => handleSubInfoChange("eyes", value)}
					/>
					<CharacterEditableInfoField
						label="Кожа"
						value={data.subInfo?.skin?.value || ""}
						onChange={(value) => handleSubInfoChange("skin", value)}
					/>
					<CharacterEditableInfoField
						label="Волосы"
						value={data.subInfo?.hair?.value || ""}
						onChange={(value) => handleSubInfoChange("hair", value)}
					/>
				</div>

				<div class="roleplay-text-grid">
					<div class="roleplay-traits-row">
						{#if canEditRoleplaySection("personality")}
							<CharacterEditableTextBlock
								title="Черты"
								content={data.text?.personality}
								minHeight="68px"
								maxHeight="68px"
								resize="none"
								onChange={(value) => handleTextSectionChange("personality", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block compact">
								<CharacterTextSection title="Черты" content={data.text?.personality} />
							</div>
						{/if}
						{#if canEditRoleplaySection("ideals")}
							<CharacterEditableTextBlock
								title="Идеалы"
								content={data.text?.ideals}
								minHeight="68px"
								maxHeight="68px"
								resize="none"
								onChange={(value) => handleTextSectionChange("ideals", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block compact">
								<CharacterTextSection title="Идеалы" content={data.text?.ideals} />
							</div>
						{/if}
						{#if canEditRoleplaySection("bonds")}
							<CharacterEditableTextBlock
								title="Привязанности"
								content={data.text?.bonds}
								minHeight="68px"
								maxHeight="68px"
								resize="none"
								onChange={(value) => handleTextSectionChange("bonds", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block compact">
								<CharacterTextSection title="Привязанности" content={data.text?.bonds} />
							</div>
						{/if}
						{#if canEditRoleplaySection("flaws")}
							<CharacterEditableTextBlock
								title="Слабости"
								content={data.text?.flaws}
								minHeight="68px"
								maxHeight="68px"
								resize="none"
								onChange={(value) => handleTextSectionChange("flaws", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block compact">
								<CharacterTextSection title="Слабости" content={data.text?.flaws} />
							</div>
						{/if}
					</div>

					<div class="roleplay-text-grid-main">
						{#if canEditRoleplaySection("appearance")}
							<CharacterEditableTextBlock
								title="Внешность"
								content={data.text?.appearance}
								onChange={(value) => handleTextSectionChange("appearance", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block">
								<CharacterTextSection title="Внешность" content={data.text?.appearance} />
							</div>
						{/if}
						{#if canEditRoleplaySection("background")}
							<CharacterEditableTextBlock
								title="История персонажа"
								content={data.text?.background}
								minHeight="180px"
								onChange={(value) => handleTextSectionChange("background", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block">
								<CharacterTextSection title="История персонажа" content={data.text?.background} />
							</div>
						{/if}
						{#if canEditRoleplaySection("allies")}
							<CharacterEditableTextBlock
								title="Союзники и организации"
								content={data.text?.allies}
								minHeight="180px"
								onChange={(value) => handleTextSectionChange("allies", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block">
								<CharacterTextSection title="Союзники и организации" content={data.text?.allies} />
							</div>
						{/if}
						{#if canEditRoleplaySection("quests")}
							<CharacterEditableTextBlock
								title="Цели"
								content={data.text?.quests}
								minHeight="180px"
								onChange={(value) => handleTextSectionChange("quests", value)}
							/>
						{:else}
							<div class="roleplay-readonly-block">
								<CharacterTextSection title="Цели" content={data.text?.quests} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

	</div>
</div>

<style>
	.character-sheet-full {
		height: 100%;
		overflow: auto;
		padding: 16px;
		background-color: var(--background-primary);
	}

	.character-sheet-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: 16px;
		max-width: 1600px;
		margin: 0 auto;
		align-items: start;
	}

	.main-stack {
		grid-column: 1;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	.main-primary {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 16px;
		min-width: 0;
	}

	.column {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.column-right {
		grid-column: 2;
		grid-row: 1;
	}

	.character-reference-blocks {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 16px;
	}

	.character-reference-block {
		min-width: 0;
	}

	.character-reference-block-half {
		flex: 1 1 280px;
	}

	.character-reference-block-full {
		flex: 1 1 100%;
	}

	.roleplay-section {
		width: 100%;
		margin: 0;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		background-color: var(--background-primary);
		overflow: hidden;
	}

	.roleplay-section-header {
		padding: 10px 14px;
		border-bottom: 1px solid var(--background-modifier-border);
		background-color: var(--background-secondary);
	}

	.roleplay-section-title {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
	}

	.roleplay-physical-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 10px;
		padding: 12px 14px 0;
	}

	.roleplay-text-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px 14px 14px;
	}

	.roleplay-traits-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 10px;
	}

	.roleplay-text-grid-main {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 12px;
	}

	.roleplay-readonly-block {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}

	.roleplay-readonly-block.compact :global(.character-text-section .section-content) {
		max-height: 68px;
		overflow: auto;
	}

	/* Responsive breakpoints */
	@media (max-width: 1200px) {
		.character-sheet-layout {
			grid-template-columns: 1fr;
		}

		.main-stack {
			display: contents;
		}

		.main-primary {
			grid-template-columns: 180px minmax(0, 1fr);
			order: 1;
		}

		.column-right {
			grid-column: auto;
			grid-row: auto;
			display: flex;
			flex-direction: column;
			order: 2;
		}

		.roleplay-section {
			order: 3;
		}
	}

	@media (max-width: 768px) {
		.character-sheet-full {
			padding: 8px;
		}

		.character-sheet-layout,
		.main-primary {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.column-right {
			display: flex;
			flex-direction: column;
		}

		.roleplay-physical-grid {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			gap: 8px;
		}

		.roleplay-traits-row,
		.roleplay-text-grid-main {
			grid-template-columns: 1fr;
		}

		.roleplay-section-header,
		.roleplay-physical-grid,
		.roleplay-text-grid {
			padding-left: 10px;
			padding-right: 10px;
		}

		.roleplay-text-grid {
			padding-bottom: 10px;
		}
	}
</style>
