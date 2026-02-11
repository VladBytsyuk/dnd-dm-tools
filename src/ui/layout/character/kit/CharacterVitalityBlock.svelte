<script lang="ts">
	import CharacterHealthBlock from "./CharacterHealthBlock.svelte";
	import CharacterInfoBlock from "./CharacterInfoBlock.svelte";
	import type { CharacterVitality } from "../../../../domain/models/character/CharacterVitality";
	import type { CharacterStats } from "../../../../domain/models/character/CharacterStats";
	import type { CharacterSkills } from "../../../../domain/models/character/CharacterSkills";
	import { calculateModifier } from "../../../../domain/modifier";

	/**
	 * Main Vitality Block - Orchestrates health and info sections
	 * Manages state and handles auto-save
	 */
	interface Props {
		vitality: CharacterVitality;
		stats: CharacterStats;
		skills: CharacterSkills;
		proficiency: number;
		level: number;
		conditions: string[];
		onChange?: (vitality: CharacterVitality, conditions: string[]) => void;
		onOpenConditionDetails?: (url: string) => void;
	}

	let { vitality, stats, skills, proficiency, level, conditions, onChange, onOpenConditionDetails }: Props =
		$props();

	let localVitality = $state({ ...vitality });
	let localConditions = $state([...conditions]);
	let saveTimeout: NodeJS.Timeout | null = null;

	// Sync when props change externally
	$effect(() => {
		localVitality = { ...vitality };
	});

	$effect(() => {
		localConditions = [...conditions];
	});

	// Calculate derived values - always recalculate from score to ensure correctness
	const conModifier = $derived(calculateModifier(stats.con?.score ?? 10));
	const wisModifier = $derived(calculateModifier(stats.wis?.score ?? 10));

	// Auto-calculate values if not set
	const hpCurrent = $derived(localVitality["hp-current"]?.value ?? 0);
	const hpTemp = $derived(localVitality["hp-temp"]?.value ?? 0);
	const hpMax = $derived(localVitality["hp-max"]?.value ?? 0);
	const hitDiceCurrent = $derived(localVitality["hp-dice-current"]?.value ?? 0);
	// Treat empty strings as unset - fallback to d8
	const hitDieType = $derived(localVitality["hit-die"]?.value || "d8");
	const deathSavesSuccess = $derived(localVitality["death-saves-success"]?.value ?? 0);
	const deathSavesFail = $derived(localVitality["death-saves-fail"]?.value ?? 0);
	const isDying = $derived(localVitality.isDying ?? false);

	const ac = $derived(localVitality.ac?.value ?? 10);
	const initiative = $derived(localVitality.initiative?.value ?? 0);
	const speed = $derived(localVitality.speed?.value ?? 30);

	// Proficiency bonus (can be overridden)
	// Note: 'proficiency' prop is already the computed bonus (2-6), not character level
	const proficiencyBonus = $derived(
		localVitality["proficiency-bonus"]?.value ?? proficiency
	);

	// Calculate passive perception (can be overridden)
	// D&D 5e: Passive Perception = 10 + WIS mod + (proficiency × proficiency level)
	const perceptionSkill = $derived(skills.perception ?? { isProf: 0, baseStat: "wis", name: "perception" });
	const perceptionProfLevel = $derived(perceptionSkill.isProf ?? 0);
	const calculatedPassivePerception = $derived(
		10 + wisModifier + perceptionProfLevel * proficiency
	);
	const passivePerception = $derived(
		localVitality["passive-perception"]?.value ?? calculatedPassivePerception
	);

	const darkvision = $derived(localVitality.darkvision?.value ?? 0);

	// Hit dice total equals character level
	// TODO: Multi-class support - Currently assumes single class.
	// Multi-class characters should calculate hit dice from array of class levels,
	// as each class contributes its own hit die type.
	const hitDiceTotal = $derived(Math.max(1, level));

	function handleChange(field: string, value: number) {
		// Single field update
		if (field === "isDying") {
			localVitality = { ...localVitality, isDying: Boolean(value) };
		} else {
			const numValue = Number(value);
			if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
				localVitality = {
					...localVitality,
					[field]: { value: numValue },
				};
			}
		}

		debouncedSave();
	}

	function handleBatchChange(updates: Record<string, number>) {
		// Batch update - apply all changes at once
		for (const [key, val] of Object.entries(updates)) {
			const numValue = Number(val);
			if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
				// Handle isDying specially - it's a bare boolean, not wrapped in {value:}
				if (key === "isDying") {
					localVitality = {
						...localVitality,
						isDying: Boolean(numValue),
					};
				} else {
					localVitality = {
						...localVitality,
						[key]: { value: numValue },
					};
				}
			}
		}

		debouncedSave();
	}

	function handleConditionsChange(newConditions: string[]) {
		localConditions = newConditions;
		debouncedSave();
	}

	function handleDeath() {
		localVitality = {
			...localVitality,
			isDying: true,
			"hp-current": { value: 0 },
		};
		debouncedSave();
	}

	function debouncedSave() {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			onChange?.(localVitality, localConditions);
		}, 1000);
	}
</script>

<div class="character-vitality-block">
	<div class="vitality-grid">
		<div class="vitality-column vitality-left">
			<CharacterHealthBlock
				{hpCurrent}
				{hpTemp}
				{hpMax}
				{hitDiceCurrent}
				{hitDiceTotal}
				{hitDieType}
				{isDying}
				deathSavesSuccess={deathSavesSuccess}
				deathSavesFail={deathSavesFail}
				{conModifier}
				onChange={handleChange}
				onBatchChange={handleBatchChange}
				onDeath={handleDeath}
			/>
		</div>

		<div class="vitality-column vitality-right">
			<CharacterInfoBlock
				{ac}
				{initiative}
				{speed}
				{proficiencyBonus}
				{passivePerception}
				{darkvision}
				conditions={localConditions}
				onChange={handleChange}
				onConditionsChange={handleConditionsChange}
				{onOpenConditionDetails}
			/>
		</div>
	</div>
</div>

<style>
	.character-vitality-block {
		background-color: var(--background-primary);
		border: 2px solid var(--text-accent);
		border-radius: 8px;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		container-type: inline-size;
	}

	/* Mobile-first: Single column default */
	.vitality-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.vitality-column {
		display: flex;
		flex-direction: column;
	}

	/* Container queries: responsive to actual container width */
	@container (min-width: 600px) {
		.vitality-grid {
			gap: 16px;
		}
	}

	@container (min-width: 768px) {
		.vitality-grid {
			grid-template-columns: minmax(200px, 35%) 1fr;
			gap: 16px;
		}
	}

	@container (min-width: 1400px) {
		.vitality-grid {
			grid-template-columns: minmax(250px, 30%) 1fr;
			gap: 20px;
		}
	}
</style>
