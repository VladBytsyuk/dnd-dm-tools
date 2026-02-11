<script lang="ts">
	import { rollRaw } from "../../../../domain/dice";
	import { Dices, Moon, Clock } from "lucide-svelte";
	import { formatModifier } from "../../../../domain/modifier";
	import { evalNumericExpression } from "../../../../domain/utils/mathExpression";

	/**
	 * Hit Dice and Rest management component
	 */
	interface Props {
		hitDiceCurrent: number;
		hitDiceTotal: number;
		hitDieType: string; // e.g., "d8"
		hpCurrent: number;
		hpMax: number;
		conModifier: number;
		onChange: (updates: Record<string, number>) => void;
	}

	let { hitDiceCurrent, hitDiceTotal, hitDieType, hpCurrent, hpMax, conModifier, onChange }: Props =
		$props();

	let diceInput = $state(String(hitDiceCurrent));

	// Sync input when prop changes
	$effect(() => {
		diceInput = String(hitDiceCurrent);
	});

	const isHpFull = $derived(hpCurrent >= hpMax);

	// Convert dice type from Latin 'd' to Cyrillic 'к' (e.g., "d8" -> "к8")
	const displayDiceType = $derived(hitDieType.replace(/^d/, 'к'));

	function handleDiceInputChange() {
		const result = evalNumericExpression(diceInput);
		if (result !== null) {
			const value = Math.floor(result);
			const clamped = Math.max(0, Math.min(hitDiceTotal, value));
			diceInput = String(clamped);
			onChange({ "hp-dice-current": clamped });
		} else {
			diceInput = String(hitDiceCurrent); // Reset to current value
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			(e.target as HTMLInputElement).blur();
		} else if (e.key === "Escape") {
			diceInput = String(hitDiceCurrent);
			(e.target as HTMLInputElement).blur();
		}
	}

	function spendHitDie() {
		if (hitDiceCurrent <= 0 || isHpFull) return;

		// Roll hit die + CON modifier (D&D 5e: minimum 0 HP restored)
		const roll = rollRaw(`1${hitDieType}`);
		const healing = Math.max(0, roll + conModifier);

		// Heal and decrement hit dice
		const newHp = Math.min(hpMax, hpCurrent + healing);

		onChange({
			"hp-current": newHp,
			"hp-dice-current": hitDiceCurrent - 1,
		});
	}

	function shortRest() {
		// Short rest: Players can spend hit dice to heal
		// No automatic restoration of resources in standard D&D 5e
		// Just enable spending hit dice (button is already available)
	}

	function longRest() {
		// Long rest (D&D 5e rules):
		// - Restore HP to max
		// - Clear temp HP
		// - Restore up to half of total hit dice (rounded down, minimum 1)
		// - Clear death saves
		const restoredDice = Math.max(1, Math.floor(hitDiceTotal / 2));
		const newDiceCount = Math.min(hitDiceCurrent + restoredDice, hitDiceTotal);

		onChange({
			"hp-current": hpMax,
			"hp-temp": 0,
			"hp-dice-current": newDiceCount,
			"death-saves-success": 0,
			"death-saves-fail": 0,
		});
	}
</script>

<div class="hit-dice-container">
	<div class="hit-dice-header">
		<div class="hit-dice-label">Кости Хитов</div>
		<div class="hit-dice-value">
			<input
				type="text"
				class="hit-dice-input"
				bind:value={diceInput}
				onblur={handleDiceInputChange}
				onkeydown={handleKeydown}
			/>
			<span class="hit-dice-separator">/</span>
			<span class="hit-dice-total">{hitDiceTotal}</span>
			<span class="hit-dice-type">({displayDiceType})</span>
		</div>
	</div>

	<div class="hit-dice-buttons">
		<button
			class="hit-dice-button"
			onclick={spendHitDie}
			disabled={hitDiceCurrent <= 0 || isHpFull}
			title="Потратить кость хитов (1{displayDiceType}{formatModifier(conModifier)})"
		>
			<Dices size={16} />
		</button>

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

	.hit-dice-value {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-normal);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.hit-dice-input {
		width: 32px;
		padding: 2px 4px;
		font-size: 12px;
		font-weight: 700;
		text-align: center;
		border: 1px solid var(--background-modifier-border);
		border-radius: 3px;
		background: var(--background-primary);
		color: var(--text-accent);
	}

	.hit-dice-input:focus {
		outline: none;
		border-color: var(--interactive-accent);
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

	.rest-button {
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
	}

	.rest-button:hover:not(:disabled) {
		background: var(--interactive-accent);
		color: white;
	}

</style>
