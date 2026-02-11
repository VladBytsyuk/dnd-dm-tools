<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullCharacterSheet } from "../../../domain/models/character";
	import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
	import { EntityLinkService } from "../../../domain/services/EntityLinkService";
	import type DndStatblockPlugin from "../../../main";

	// Import kit components
	import CharacterHeader from "./kit/CharacterHeader.svelte";
	import CharacterAbilityGroup from "./kit/CharacterAbilityGroup.svelte";
	import CharacterVitalityBlock from "./kit/CharacterVitalityBlock.svelte";
	import CharacterCombat from "./kit/CharacterCombat.svelte";
	import CharacterSpellbook from "./kit/CharacterSpellbook.svelte";
	import CharacterEquipment from "./kit/CharacterEquipment.svelte";
	import CharacterTextSection from "./kit/CharacterTextSection.svelte";
	import CharacterInfoBox from "./kit/CharacterInfoBox.svelte";

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
		migrateToMulticlass();
	});
	onDestroy(() => {
		diceRollersManager.onDestroy();
	});

	const { data } = currentItem;

	// Create EntityLinkService if repository is available
	let entityLinkService: EntityLinkService | undefined;
	if (repository) {
		const database = repository.getDatabase();
		entityLinkService = new EntityLinkService(database);
	}

	// Autocomplete data state
	let raceOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let backgroundOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let classOptions = $state<Array<{ name: { rus: string; eng: string }; url: string }>>([]);
	let archetypeOptions = $state<Array<{ name: { rus: string; eng: string }; url: string; parentClassUrl: string }>>([]);

	// Fetch autocomplete data from database
	$effect(() => {
		if (repository) {
			const database = repository.getDatabase();

			// Fetch all autocomplete data in parallel with error handling
			Promise.all([
				database.smallRaceDao.readAllItems(null, null),
				database.smallBackgroundDao.readAllItems(null, null),
				database.smallClassDao.readAllItems(null, null)
			])
				.then(([races, backgrounds, classes]) => {
					// Map races
					raceOptions = races.map(r => ({
						name: r.name,
						url: r.url
					}));

					// Map backgrounds
					backgroundOptions = backgrounds.map(b => ({
						name: b.name,
						url: b.url
					}));

					// Map classes (filter out archetypes)
					classOptions = classes
						.filter(c => !c.isArchetype)
						.map(c => ({
							name: c.name,
							url: c.url
						}));

					// Map archetypes (subclasses)
					archetypeOptions = classes
						.filter(c => c.isArchetype)
						.map(c => ({
							name: c.name,
							url: c.url,
							parentClassUrl: c.parentClassUrl || ''
						}));
				})
				.catch(error => {
					console.error('Failed to load autocomplete data:', error);
					// Set empty arrays as fallback to allow component to function
					raceOptions = [];
					backgroundOptions = [];
					classOptions = [];
					archetypeOptions = [];
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

	// Auto-save functionality
	let saveTimeout: NodeJS.Timeout | null = null;
	let isSaving = $state(false);

	async function debouncedSave() {
		if (!repository) return;

		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			isSaving = true;
			try {
				await repository.putItem(currentItem);
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

	// Database lookup wrappers
	async function lookupRace(race: string) {
		return entityLinkService ? await entityLinkService.findRace(race) : { exists: false };
	}

	async function lookupClass(className: string) {
		return entityLinkService ? await entityLinkService.findClass(className) : { exists: false };
	}

	async function lookupSubclass(subclassName: string) {
		return entityLinkService ? await entityLinkService.findArchetype(subclassName) : { exists: false };
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

	const stats = $derived({
		str: { score: data.stats?.str?.score || 10, modifier: data.stats?.str?.modifier || 0 },
		dex: { score: data.stats?.dex?.score || 10, modifier: data.stats?.dex?.modifier || 0 },
		con: { score: data.stats?.con?.score || 10, modifier: data.stats?.con?.modifier || 0 },
		int: { score: data.stats?.int?.score || 10, modifier: data.stats?.int?.modifier || 0 },
		wis: { score: data.stats?.wis?.score || 10, modifier: data.stats?.wis?.modifier || 0 },
		cha: { score: data.stats?.cha?.score || 10, modifier: data.stats?.cha?.modifier || 0 }
	});

	const saves = $derived({
		str: { isProf: data.saves?.str?.isProf || false },
		dex: { isProf: data.saves?.dex?.isProf || false },
		con: { isProf: data.saves?.con?.isProf || false },
		int: { isProf: data.saves?.int?.isProf || false },
		wis: { isProf: data.saves?.wis?.isProf || false },
		cha: { isProf: data.saves?.cha?.isProf || false }
	});

	const vitality = $derived({
		'hp-max': data.vitality?.['hp-max']?.value || 0,
		'hp-current': data.vitality?.['hp-current']?.value || 0,
		ac: data.vitality?.ac?.value || 10,
		speed: data.vitality?.speed?.value?.toString() || '30',
		initiative: data.vitality?.initiative?.value || 0,
		'hit-die': data.vitality?.['hit-die']?.value || 'd8',
		'hp-dice-current': data.vitality?.['hp-dice-current']?.value || 0,
		isDying: data.vitality?.isDying?.value || false
	});

	const proficiency = $derived(data.proficiency || 2);

	const weaponsList = $derived(
		(data.weaponsList || []).map((w: any) => ({
			name: w.name?.value || '',
			mod: w.mod?.value || '',
			dmg: w.dmg?.value || '',
			ability: w.ability?.value,
			isProf: w.isProf?.value || false
		}))
	);

	const attunementsList = $derived(
		(data.attunementsList || []).map((a: any) => ({
			value: a.value || '',
			checked: a.checked || false
		}))
	);

	const coins = $derived(data.coins ? {
		gp: data.coins.gp?.value || 0,
		sp: data.coins.sp?.value || 0,
		cp: data.coins.cp?.value || 0,
		pp: data.coins.pp?.value || 0,
		ep: data.coins.ep?.value || 0
	} : undefined);

	const spellsInfo = $derived(data.spellsInfo ? {
		base: data.spellsInfo.base?.value,
		save: parseInt(data.spellsInfo.save?.value?.toString() || '0') || undefined,
		mod: parseInt(data.spellsInfo.mod?.value?.toString() || '0') || undefined
	} : undefined);

	const spellTexts = $derived({
		'spells-level-0': data.text?.['spells-level-0'] || '',
		'spells-level-1': data.text?.['spells-level-1'] || '',
		'spells-level-2': data.text?.['spells-level-2'] || '',
		'spells-level-3': data.text?.['spells-level-3'] || '',
		'spells-level-4': data.text?.['spells-level-4'] || '',
		'spells-level-5': data.text?.['spells-level-5'] || '',
		'spells-level-6': data.text?.['spells-level-6'] || '',
		'spells-level-7': data.text?.['spells-level-7'] || '',
		'spells-level-8': data.text?.['spells-level-8'] || '',
		'spells-level-9': data.text?.['spells-level-9'] || ''
	});

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

	const hasPhysicalInfo = $derived(
		data.subInfo?.age?.value ||
		data.subInfo?.height?.value ||
		data.subInfo?.weight?.value ||
		data.subInfo?.eyes?.value ||
		data.subInfo?.skin?.value ||
		data.subInfo?.hair?.value
	);
</script>

<div class="character-sheet-full">
	<div class="character-sheet-layout">
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

			{#if hasPhysicalInfo}
				<div class="physical-info-section">
					<h3 class="section-title">Физические характеристики</h3>
					<div class="physical-info-list">
						{#if data.subInfo?.age?.value}
							<CharacterInfoBox label="Возраст" value={data.subInfo.age.value} />
						{/if}
						{#if data.subInfo?.height?.value}
							<CharacterInfoBox label="Рост" value={data.subInfo.height.value} />
						{/if}
						{#if data.subInfo?.weight?.value}
							<CharacterInfoBox label="Вес" value={data.subInfo.weight.value} />
						{/if}
						{#if data.subInfo?.eyes?.value}
							<CharacterInfoBox label="Глаза" value={data.subInfo.eyes.value} />
						{/if}
						{#if data.subInfo?.skin?.value}
							<CharacterInfoBox label="Кожа" value={data.subInfo.skin.value} />
						{/if}
						{#if data.subInfo?.hair?.value}
							<CharacterInfoBox label="Волосы" value={data.subInfo.hair.value} />
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Center Column: Header, Vitality, Combat, Equipment, Description -->
		<div class="column column-center">
			<CharacterHeader
				name={data.name}
				info={headerInfo}
				avatar={data.avatar}
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

			<CharacterVitalityBlock {vitality} />

			<CharacterCombat
				{proficiency}
				{weaponsList}
				attacksText={data.text?.attacks}
			/>

			<CharacterEquipment
				equipmentText={data.text?.equipment}
				proficienciesText={data.text?.prof}
				{coins}
				{attunementsList}
			/>

			{#if data.text?.personality}
				<CharacterTextSection title="Личность" content={data.text.personality} collapsible={true} />
			{/if}

			{#if data.text?.ideals}
				<CharacterTextSection title="Идеалы" content={data.text.ideals} collapsible={true} />
			{/if}

			{#if data.text?.bonds}
				<CharacterTextSection title="Привязанности" content={data.text.bonds} collapsible={true} />
			{/if}

			{#if data.text?.flaws}
				<CharacterTextSection title="Слабости" content={data.text.flaws} collapsible={true} />
			{/if}

			{#if data.text?.background}
				<CharacterTextSection title="История персонажа" content={data.text.background} collapsible={true} />
			{/if}

			{#if data.text?.allies}
				<CharacterTextSection title="Союзники и организации" content={data.text.allies} collapsible={true} />
			{/if}

			{#if data.text?.quests}
				<CharacterTextSection title="Задания" content={data.text.quests} collapsible={true} />
			{/if}
		</div>

		<!-- Right Column: Spellcasting, Features, Traits -->
		<div class="column column-right">
			<CharacterSpellbook
				{spellsInfo}
				spells={data.spells}
				{spellTexts}
			/>

			{#if data.text?.features}
				<CharacterTextSection title="Умения и особенности" content={data.text.features} collapsible={true} />
			{/if}

			{#if data.text?.traits}
				<CharacterTextSection title="Расовые особенности" content={data.text.traits} collapsible={true} />
			{/if}
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
		grid-template-columns: 250px 1fr 300px;
		gap: 16px;
		max-width: 1600px;
		margin: 0 auto;
		padding-bottom: 32px;
	}

	.column {
		display: flex;
		flex-direction: column;
	}

	.physical-info-section {
		padding: 12px;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.section-title {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-normal);
		text-align: center;
		border-bottom: 1px solid var(--background-modifier-border);
		padding-bottom: 8px;
	}

	.physical-info-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* Responsive breakpoints */
	@media (max-width: 1200px) {
		.character-sheet-layout {
			grid-template-columns: 200px 1fr;
		}

		.column-right {
			grid-column: 1 / -1;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
			gap: 16px;
		}
	}

	@media (max-width: 768px) {
		.character-sheet-full {
			padding: 8px;
		}

		.character-sheet-layout {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.column-right {
			display: flex;
			flex-direction: column;
		}
	}
</style>
