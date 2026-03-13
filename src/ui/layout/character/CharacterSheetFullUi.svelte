<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullCharacterSheet } from "../../../domain/models/character";
	import type { IUiEventListener } from "../../../domain/listeners/ui_event_listener";
	import type { CharacterSheetRepository } from "../../../data/repositories/CharacterSheetRepository";
	import type { ClassEntry } from "../../../domain/models/character/ClassEntry";
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
	import { CharacterSheetEditorController } from "./characterSheetEditorController";
	import {
		CHARACTER_ABILITY_GROUPS,
		getCharacterCoins,
		getCharacterConditions,
		getCharacterHeaderInfo,
		getCharacterProficiencies,
		getCharacterProficiency,
		getCharacterSaves,
		getCharacterStats,
		getCharacterVitality,
		getCharacterWeaponsList,
	} from "./characterSheetSelectors";
	import type {
		CharacterEditorTextSection,
		CharacterSheetSessionState,
		CharacterSubInfoField,
	} from "../../../data/repositories/characterSheetTypes";

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
		editorController.destroy();
		diceRollersManager.onDestroy();
	});

	const editorController = new CharacterSheetEditorController({
		repository,
		onStateChange: (state) => {
			sessionState = state;
		},
	});
	let sessionState = $state<CharacterSheetSessionState>(editorController.getState());
	editorController.open(currentItem);
	sessionState = editorController.getState();
	let data = $derived(sessionState.draft?.data ?? currentItem.data);
	let isSaving = $derived(sessionState.status === "saving");

	$effect(() => {
		editorController.open(currentItem);
		currentItem.url;
		editorController.applyLegacyMigrations();
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

	// Event handlers for character header
	function handleNameChange(newName: string) {
		editorController.updateName(newName);
	}

	function handleClassesChange(newClasses: ClassEntry[]) {
		editorController.updateClasses(newClasses);
	}

	function handleRaceChange(newRace: string) {
		editorController.updateRace(newRace);
	}

	function handleBackgroundChange(newBackground: string) {
		editorController.updateBackground(newBackground);
	}

	function handlePlayerNameChange(newPlayerName: string) {
		editorController.updatePlayerName(newPlayerName);
	}

	function handleAlignmentChange(newAlignment: string) {
		editorController.updateAlignment(newAlignment);
	}

	function handleExperienceAdd(additionalXp: number) {
		editorController.addExperience(additionalXp);
	}

	function handleVitalityChange(newVitality: typeof data.vitality, newConditions: string[]) {
		editorController.updateVitality({ vitality: newVitality, conditions: newConditions });
	}

	function handleWeaponsListChange(newWeaponsList: typeof data.weaponsList) {
		editorController.updateWeaponsList(newWeaponsList);
	}

	function handleEquipmentChange(newCoins: typeof data.coins, newEquipmentList: NonNullable<typeof data.equipmentList>, newEquipmentText: string) {
		editorController.updateEquipment({
			coins: newCoins,
			equipmentList: newEquipmentList,
			equipmentText: newEquipmentText,
		});
	}

	function handleSubInfoChange(field: CharacterSubInfoField, value: string) {
		editorController.updateSubInfo(field, value);
	}

	function handleTextSectionChange(section: CharacterEditorTextSection, newText: string) {
		editorController.updateTextSection(section, newText);
	}

	function canEditRoleplaySection(section: CharacterEditorTextSection): boolean {
		return editorController.canEditRoleplaySection(section);
	}

	function handleProficienciesChange(newProficiencies: typeof data.proficiencies) {
		editorController.updateProficiencies(newProficiencies);
	}

	function handleSpellbookChange(newSpellbook: typeof data.spells) {
		editorController.updateSpellbook(newSpellbook);
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
	const headerInfo = $derived(getCharacterHeaderInfo(data));
	const stats = $derived(getCharacterStats(data));
	const saves = $derived(getCharacterSaves(data));
	const vitality = $derived(getCharacterVitality(data));
	const conditions = $derived(getCharacterConditions(data));
	const proficiency = $derived(getCharacterProficiency(data));
	const weaponsList = $derived(getCharacterWeaponsList(data));
	const proficiencies = $derived(getCharacterProficiencies(data));
	const coins = $derived(getCharacterCoins(data));
	const abilityGroups = CHARACTER_ABILITY_GROUPS;

</script>

<div class="character-sheet-full">
	{#if sessionState.errorMessage}
		<div class="character-sheet-status character-sheet-status-error">
			{sessionState.errorMessage}
		</div>
	{:else if sessionState.status === "saved" && sessionState.lastSavedAt}
		<div class="character-sheet-status">Сохранено</div>
	{/if}
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

	.character-sheet-status {
		margin-bottom: 12px;
		padding: 8px 12px;
		border-radius: 6px;
		background: var(--background-secondary);
		color: var(--text-muted);
		font-size: 0.9em;
	}

	.character-sheet-status-error {
		background: var(--background-modifier-error);
		color: var(--text-on-accent);
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
