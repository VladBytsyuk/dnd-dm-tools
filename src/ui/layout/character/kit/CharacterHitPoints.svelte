<script lang="ts">
	import { evalNumericExpression } from "../../../../domain/utils/mathExpression";

	/**
	 * Hit Points management component
	 * Supports math expressions in inputs (e.g., "20-5", "10+3")
	 */
	interface Props {
		hpCurrent: number;
		hpTemp: number;
		hpMax: number;
		isDying: boolean;
		onChange: (field: string, value: number) => void;
	}

	let { hpCurrent, hpTemp, hpMax, isDying, onChange }: Props = $props();

	let currentInput = $state(String(hpCurrent));
	let tempInput = $state(String(hpTemp));
	let maxInput = $state(String(hpMax));

	// Update inputs when props change externally
	$effect(() => {
		currentInput = String(hpCurrent);
	});
	$effect(() => {
		tempInput = String(hpTemp);
	});
	$effect(() => {
		maxInput = String(hpMax);
	});

	const hpPercentage = $derived((hpCurrent / hpMax) * 100);
	const hpColor = $derived(
		hpPercentage > 50
			? "var(--color-green)"
			: hpPercentage > 25
				? "var(--color-yellow)"
				: "var(--color-red)"
	);

	// Accessibility: Announce HP changes to screen readers
	let announceText = $state("");
	$effect(() => {
		if (hpCurrent === 0) {
			announceText = "Хиты упали до нуля. Персонаж без сознания.";
		} else if (isDying) {
			announceText = "Персонаж при смерти.";
		} else {
			announceText = `Текущие хиты: ${hpCurrent} из ${hpMax}`;
		}
	});

	function handleCurrentBlur() {
		const result = evalNumericExpression(currentInput);
		if (result !== null) {
			const value = Math.floor(result);

			if (value < -hpMax) {
				// Massive damage - send raw negative value for instant death detection
				// Parent will detect value < -hpMax and trigger instant death
				onChange("hp-current", value);
				currentInput = "0";
			} else {
				// Normal case - clamp to valid range [0, hpMax]
				const clamped = Math.max(0, Math.min(hpMax, value));
				onChange("hp-current", clamped);
				currentInput = String(clamped);
			}
		} else {
			currentInput = String(hpCurrent);
		}
	}

	function handleTempBlur() {
		const result = evalNumericExpression(tempInput);
		if (result !== null) {
			const clamped = Math.max(0, Math.floor(result));
			tempInput = String(clamped);
			onChange("hp-temp", clamped);
		} else {
			tempInput = String(hpTemp);
		}
	}

	function handleMaxBlur() {
		const result = evalNumericExpression(maxInput);
		if (result !== null) {
			const clamped = Math.max(1, Math.floor(result));
			maxInput = String(clamped);
			onChange("hp-max", clamped);
		} else {
			maxInput = String(hpMax);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		} else if (e.key === "Escape") {
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
	}
</script>

<div class="hp-container">
	<!-- Accessibility: Screen reader announcements -->
	<div aria-live="polite" aria-atomic="true" class="sr-only">
		{announceText}
	</div>

	<div class="stat-label">Хиты</div>

	<div class="hp-inputs">
		<div class="hp-input-group">
			<input
				id="hp-current-input"
				type="text"
				class="hp-input hp-current-input"
				class:dying={isDying}
				bind:value={currentInput}
				onblur={handleCurrentBlur}
				onkeydown={handleKeydown}
			/>
			<label class="hp-input-label" for="hp-current-input">Текущие</label>
		</div>

		<div class="hp-input-group">
			<input
				id="hp-temp-input"
				type="text"
				class="hp-input hp-temp-input"
				bind:value={tempInput}
				onblur={handleTempBlur}
				onkeydown={handleKeydown}
			/>
			<label class="hp-input-label" for="hp-temp-input">Временные</label>
		</div>
	</div>

	<div class="hp-max-group">
		<input
			id="hp-max-input"
			type="text"
			class="hp-input hp-max-input"
			bind:value={maxInput}
			onblur={handleMaxBlur}
			onkeydown={handleKeydown}
		/>
		<label class="hp-max-label" for="hp-max-input">Максимум</label>
	</div>

	<div class="hp-bar">
		<div
			class="hp-fill"
			style="width: {Math.max(0, Math.min(100, hpPercentage))}%; background-color: {hpColor};"
		></div>
	</div>
</div>

<style>
	.hp-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-left: 8px;
		padding-right: 8px;
		padding-top: 8px;
		container-type: inline-size;
	}

	.stat-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
	}

	/* Mobile: Single column for all inputs */
	.hp-inputs {
		display: grid;
		grid-template-columns: 1fr;
		gap: 6px;
	}

	.hp-input-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	/* Mobile: Larger labels for readability */
	.hp-input-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
	}

	/* Mobile: 16px font prevents iOS zoom on focus */
	.hp-input {
		padding: 4px;
		font-size: 16px;
		font-weight: 700;
		text-align: center;
		border: 2px solid var(--background-modifier-border);
		border-radius: 4px;
		background: var(--background-primary);
		color: var(--text-normal);
		transition: border-color 0.2s;
		width: 100%;
		box-sizing: border-box;
	}

	.hp-input:focus {
		outline: none;
		border-color: var(--interactive-accent);
	}

	.hp-current-input {
		color: var(--text-accent);
	}

	.hp-current-input.dying {
		color: var(--color-red);
		border-color: var(--color-red);
	}

	.hp-temp-input {
		color: var(--text-normal);
	}

	.hp-max-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.hp-max-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
	}

	.hp-max-input {
		color: var(--text-normal);
	}

	.hp-bar {
		height: 12px;
		background-color: var(--background-secondary);
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--background-modifier-border);
	}

	.hp-fill {
		height: 100%;
		transition:
			width 0.3s ease,
			background-color 0.3s ease;
		border-radius: 6px;
	}

	/* Container queries: Two columns when enough space */
	@container (min-width: 200px) {
		.hp-inputs {
			grid-template-columns: 1fr 1fr;
			gap: 4px;
		}

		.hp-input-label {
			font-size: 8px;
		}

		.hp-max-label {
			font-size: 8px;
		}

		.hp-input {
			font-size: 14px;
		}
	}

	/* Screen reader only text */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
