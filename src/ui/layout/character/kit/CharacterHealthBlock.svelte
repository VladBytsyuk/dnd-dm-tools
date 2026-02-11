<script lang="ts">
	import CharacterHitPoints from "./CharacterHitPoints.svelte";
	import CharacterHitDice from "./CharacterHitDice.svelte";
	import CharacterDeathSaves from "./CharacterDeathSaves.svelte";

	/**
	 * Health Block - Left section of vitality block
	 * Contains HP, hit dice, and death saves
	 */
	interface Props {
		hpCurrent: number;
		hpTemp: number;
		hpMax: number;
		hitDiceCurrent: number;
		hitDiceTotal: number;
		hitDieType: string;
		isDying: boolean;
		deathSavesSuccess: number;
		deathSavesFail: number;
		conModifier: number;
		onChange: (field: string, value: number) => void;
		onBatchChange?: (updates: Record<string, number>) => void;
		onDeath: () => void;
	}

	let {
		hpCurrent,
		hpTemp,
		hpMax,
		hitDiceCurrent,
		hitDiceTotal,
		hitDieType,
		isDying,
		deathSavesSuccess,
		deathSavesFail,
		conModifier,
		onChange,
		onBatchChange,
		onDeath,
	}: Props = $props();

	function handleHpChange(field: string, value: number) {
		// D&D 5e Massive Damage: If damage brings HP to negative max HP or below, instant death
		if (field === "hp-current" && value < -hpMax) {
			// Batch update: massive damage instant death
			if (onBatchChange) {
				onBatchChange({
					"hp-current": 0,
					"death-saves-success": 0,
					"death-saves-fail": 3,
				});
			} else {
				onChange("hp-current", 0);
				onChange("death-saves-success", 0);
				onChange("death-saves-fail", 3);
			}
			onDeath();
			return;
		}

		onChange(field, value);

		// Clear death saves and isDying when HP > 0
		if (field === "hp-current" && value > 0) {
			// Batch update: clear death saves
			if (onBatchChange) {
				onBatchChange({
					"death-saves-success": 0,
					"death-saves-fail": 0,
					isDying: 0,
				});
			} else {
				onChange("death-saves-success", 0);
				onChange("death-saves-fail", 0);
				onChange("isDying", 0);
			}
		}
		// Set isDying to false when HP reaches exactly 0 (unconscious, not dead)
		else if (field === "hp-current" && value === 0) {
			onChange("isDying", 0);
		}
	}

	function handleHitDiceChange(updates: Record<string, number>) {
		// Pass the entire updates object as a batch update
		if (onBatchChange) {
			onBatchChange(updates);
		} else {
			// Fallback: apply updates one by one
			for (const [field, value] of Object.entries(updates)) {
				onChange(field, value);
			}
		}
	}

	function handleDeathSavesChange(success: number, fail: number) {
		// Batch update: both death save counters
		if (onBatchChange) {
			onBatchChange({
				"death-saves-success": success,
				"death-saves-fail": fail,
			});
		} else {
			onChange("death-saves-success", success);
			onChange("death-saves-fail", fail);
		}
	}

	function handleDeathSaveRestore() {
		// Natural 20 on death save: restore 1 HP and clear death saves
		if (onBatchChange) {
			onBatchChange({
				"hp-current": 1,
				"death-saves-success": 0,
				"death-saves-fail": 0,
				isDying: 0,
			});
		} else {
			onChange("hp-current", 1);
			onChange("death-saves-success", 0);
			onChange("death-saves-fail", 0);
			onChange("isDying", 0);
		}
	}
</script>

<div class="health-block">
	<CharacterHitPoints
		{hpCurrent}
		{hpTemp}
		{hpMax}
		{isDying}
		onChange={handleHpChange}
	/>

	<div class="dice-and-saves">
		<CharacterHitDice
			{hitDiceCurrent}
			{hitDiceTotal}
			{hitDieType}
			{hpCurrent}
			{hpMax}
			{conModifier}
			onChange={handleHitDiceChange}
		/>

		<CharacterDeathSaves
			successCount={deathSavesSuccess}
			failCount={deathSavesFail}
			isDisabled={hpCurrent !== 0 || isDying || deathSavesSuccess >= 3 || deathSavesFail >= 3}
			onChange={handleDeathSavesChange}
			{onDeath}
			onRestore={handleDeathSaveRestore}
		/>
	</div>
</div>

<style>
	.health-block {
		display: flex;
		flex-direction: column;
		gap: 8px;
		container-type: inline-size;
	}

	.dice-and-saves {
		display: flex;
		flex-direction: row;
		gap: 4px;
		align-items: center;
		justify-content: space-between;
	}

	/* Hit dices fills remaining width */
	.dice-and-saves > :global(:first-child) {
		flex: 1 1 auto;
		min-width: 0;
	}

	/* Death saves aligned right, centered, minimal width */
	.dice-and-saves > :global(:last-child) {
		flex: 0 0 auto;
		align-self: center;
	}

	/* Stack vertically on very narrow containers */
	@container (max-width: 250px) {
		.dice-and-saves {
			flex-direction: column;
		}

		.dice-and-saves > :global(:last-child) {
			align-self: stretch;
		}
	}
</style>
