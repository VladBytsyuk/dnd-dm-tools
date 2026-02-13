<script lang="ts">
	import { rollRaw } from "../../../../domain/dice";
	import { Dices, Moon, Clock } from "lucide-svelte";
	import { formatModifier } from "../../../../domain/modifier";
	import { evalNumericExpression } from "../../../../domain/utils/mathExpression";
	import { getSortedDieTypes, spendHitDie, recoverHitDiceOnLongRest, type HitDicePools } from "../../../../domain/utils/multiclassHitDice";

	/**
	 * Hit Dice and Rest management component
	 * Supports multiclass characters with different hit die types
	 */
	interface Props {
		hitDiceCurrent: number; // Legacy - for backward compatibility
		hitDiceTotal: number; // Legacy - for backward compatibility
		hitDieType: string; // Legacy - for backward compatibility
		hitDicePools: HitDicePools; // Multiclass hit dice pools
		hpCurrent: number;
		hpMax: number;
		conModifier: number;
		onChange: (updates: Record<string, number | HitDicePools>) => void;
	}

	let { hitDiceCurrent, hitDiceTotal, hitDieType, hitDicePools, hpCurrent, hpMax, conModifier, onChange }: Props =
		$props();

	const isHpFull = $derived(hpCurrent >= hpMax);

	// Get sorted die types for display (d4, d6, d8, d10, d12)
	const sortedDieTypes = $derived(getSortedDieTypes(hitDicePools));

	// Convert dice type from Latin 'd' to Cyrillic 'к' (e.g., "d8" -> "к8")
	function displayDiceType(dieType: string): string {
		return dieType.replace(/^d/, 'к');
	}

	function spendHitDieOfType(dieType: string) {
		if (isHpFull) return;

		const pool = hitDicePools[dieType];
		if (!pool || pool.current <= 0) return;

		// Roll hit die + CON modifier (D&D 5e: minimum 0 HP restored)
		const roll = rollRaw(`1${dieType}`);
		const healing = Math.max(0, roll + conModifier);

		// Heal and update pools
		const newPools = spendHitDie(hitDicePools, dieType);
		if (!newPools) return;

		const newHp = Math.min(hpMax, hpCurrent + healing);

		onChange({
			"hp-current": newHp,
			"hp-dice-multi": newPools,
		});
	}

	function shortRest() {
		// Short rest: Players can spend hit dice to heal
		// No automatic restoration of resources in standard D&D 5e
		// Just enable spending hit dice (buttons are already available)
	}

	function longRest() {
		// Long rest (D&D 5e rules):
		// - Restore HP to max
		// - Clear temp HP
		// - Restore up to half of total hit dice (rounded down, minimum 1)
		// - Clear death saves
		const recoveredPools = recoverHitDiceOnLongRest(hitDicePools);

		onChange({
			"hp-current": hpMax,
			"hp-temp": 0,
			"hp-dice-multi": recoveredPools,
			"death-saves-success": 0,
			"death-saves-fail": 0,
		});
	}

	// Check if any hit dice are available
	const hasAnyDice = $derived(
		Object.values(hitDicePools).some((pool) => pool.current > 0)
	);
</script>

<div class="hit-dice-container">
	<div class="hit-dice-header">
		<div class="hit-dice-label">Кости Хитов</div>
	</div>

	<!-- Multiclass: Display multiple rows, one per die type -->
	<div class="hit-dice-pools">
		{#each sortedDieTypes as dieType}
			{@const pool = hitDicePools[dieType]}
			<div class="hit-dice-row">
				<div class="hit-dice-value">
					<span class="hit-dice-current">{pool.current}</span>
					<span class="hit-dice-separator">/</span>
					<span class="hit-dice-total">{pool.total}</span>
					<span class="hit-dice-type">({displayDiceType(dieType)})</span>
				</div>
				<button
					class="hit-dice-button spend-button"
					onclick={() => spendHitDieOfType(dieType)}
					disabled={pool.current <= 0 || isHpFull}
					title="Потратить кость хитов (1{displayDiceType(dieType)}{formatModifier(conModifier)})"
				>
					<Dices size={14} />
				</button>
			</div>
		{/each}
	</div>

	<div class="hit-dice-buttons">
		<button class="hit-dice-button rest-button" onclick={shortRest} title="Короткий отдых">
			<Clock size={16} />
		</button>

		<button class="hit-dice-button rest-button" onclick={longRest} title="Длинный отдых">
			<Moon size={16} />
		</button>
	</div>
</div>

<style>
	.hit-dice-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 6px 8px;
	}

	.hit-dice-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.hit-dice-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.hit-dice-pools {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.hit-dice-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		padding: 2px 0;
	}

	.hit-dice-value {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-normal);
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.hit-dice-current {
		color: var(--text-accent);
	}

	.hit-dice-separator {
		color: var(--text-muted);
	}

	.hit-dice-total {
		color: var(--text-normal);
	}

	.hit-dice-type {
		color: var(--text-muted);
		font-size: 11px;
	}

	/* Mobile: Allow wrapping on very narrow screens */
	.hit-dice-buttons {
		display: flex;
		flex-direction: row;
		gap: 4px;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 4px;
	}

	.hit-dice-button {
		padding: 8px;
		font-size: 11px;
		font-weight: 600;
		border-radius: 4px;
		border: 2px solid var(--background-modifier-border);
		background: var(--background-primary);
		color: var(--text-normal);
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1 1 auto;
		min-width: 40px; /* Minimum touchable size */
	}

	.hit-dice-button:hover:not(:disabled) {
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
	}

	.hit-dice-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spend-button {
		flex: 0 0 auto;
		min-width: 32px;
		padding: 4px 6px;
	}

	.rest-button {
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
	}

	.rest-button:hover:not(:disabled) {
		background: var(--interactive-accent);
		color: white;
	}
</style>
