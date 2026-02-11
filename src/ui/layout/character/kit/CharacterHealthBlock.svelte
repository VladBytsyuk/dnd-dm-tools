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
		onChange: (field: string, value: number | Record<string, number>) => void;
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
		onDeath,
	}: Props = $props();

	function handleHpChange(field: string, value: number) {
		// D&D 5e Massive Damage: If damage brings HP to negative max HP or below, instant death
		if (field === "hp-current" && value < -hpMax) {
			onChange("hp-current", 0);
			onChange("death-saves-success", 0);
			onChange("death-saves-fail", 3);
			onDeath();
			return;
		}

		onChange(field, value);

		// Clear death saves and isDying when HP > 0
		if (field === "hp-current" && value > 0) {
			onChange("death-saves-success", 0);
			onChange("death-saves-fail", 0);
			onChange("isDying", 0);
		}
		// Set isDying to false when HP reaches exactly 0 (unconscious, not dead)
		else if (field === "hp-current" && value === 0) {
			onChange("isDying", 0);
		}
	}

	function handleHitDiceChange(updates: Record<string, number>) {
		// Pass the entire updates object as a batch update
		onChange("", updates);
	}

	function handleDeathSavesChange(success: number, fail: number) {
		onChange("death-saves-success", success);
		onChange("death-saves-fail", fail);
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
	/>
</div>

<style>
	.health-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
