<script lang="ts">
	import { roll, d20 } from "../../../../domain/dice";
	import { Dices } from "lucide-svelte";
	import { Notice } from "obsidian";

	/**
	 * Death Saving Throws component - Horizontal layout
	 * Layout: |Successes    Throw Button    Failures|
	 */
	interface Props {
		successCount: number;
		failCount: number;
		isDisabled: boolean;
		onChange: (success: number, fail: number) => void;
		onDeath: () => void;
	}

	let { successCount, failCount, isDisabled, onChange, onDeath }: Props = $props();

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function toggleSuccess(index: number) {
		const newCount = successCount > index ? index : index + 1;
		onChange(clamp(newCount, 0, 3), failCount);
	}

	function toggleFail(index: number) {
		const newCount = failCount > index ? index : index + 1;
		const clamped = clamp(newCount, 0, 3);
		onChange(successCount, clamped);
		if (clamped >= 3) {
			onDeath();
		}
	}

	function rollDeathSave() {
		const result = roll(d20()(0));

		let newSuccess = successCount;
		let newFail = failCount;
		let message = `Спасбросок от смерти: ${result}`;

		if (result === 1) {
			newFail += 2;
			message += " (критический провал, +2 провала)";
		} else if (result >= 2 && result <= 9) {
			newFail += 1;
			message += " (провал)";
		} else if (result >= 10 && result <= 19) {
			newSuccess += 1;
			message += " (успех)";
		} else if (result === 20) {
			newSuccess += 2;
			message += " (критический успех, +2 успеха)";
		}

		newSuccess = clamp(newSuccess, 0, 3);
		newFail = clamp(newFail, 0, 3);

		// Show notification
		new Notice(message, 3000);

		onChange(newSuccess, newFail);

		if (newFail >= 3) {
			onDeath();
		}
	}
</script>

<div class="death-saves-container">
	<div class="death-saves-circles-wrapper">
		<div class="death-saves-circles">
			{#each [0, 1, 2] as i}
				<button
					class="death-save-circle success"
					class:filled={i < successCount}
					onclick={() => toggleSuccess(i)}
					disabled={isDisabled}
					aria-label="Успех {i + 1}"
					title="Успех {i + 1}"
				>
				</button>
			{/each}
		</div>

		<div class="death-saves-circles">
			{#each [0, 1, 2] as i}
				<button
					class="death-save-circle fail"
					class:filled={i < failCount}
					onclick={() => toggleFail(i)}
					disabled={isDisabled}
					aria-label="Провал {i + 1}"
					title="Провал {i + 1}"
				>
				</button>
			{/each}
		</div>
	</div>

	<button class="death-save-roll-button" onclick={rollDeathSave} disabled={isDisabled} title="Бросить спасбросок от смерти (d20)">
		<Dices size={16} />
	</button>
</div>

<style>
	/* Mobile: Vertical stack */
	.death-saves-container {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 6px 8px;
		gap: 6px;
	}

	.death-saves-circles-wrapper {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center; /* Center circles on mobile */
	}

	.death-saves-circles {
		display: flex;
		gap: 3px;
	}

	/* Mobile: Larger circles for better touch targets */
	.death-save-circle {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--background-modifier-border);
		background: var(--background-primary);
		font-size: 14px;
		line-height: 1;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.death-save-circle.success {
		border-color: var(--color-green);
	}

	.death-save-circle.fail {
		border-color: var(--color-red);
	}

	.death-save-circle:hover:not(:disabled) {
		opacity: 0.8;
	}

	.death-save-circle.success.filled {
		background-color: var(--color-green);
		border-color: var(--color-green);
		color: white;
	}

	.death-save-circle.fail.filled {
		background-color: var(--color-red);
		border-color: var(--color-red);
		color: white;
	}

	.death-save-circle:not(.filled) {
		color: var(--text-muted);
	}

	.death-save-circle:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.death-save-circle:disabled:hover {
		border-color: var(--background-modifier-border);
	}

	/* Mobile: Full width button */
	.death-save-roll-button {
		padding: 8px;
		font-size: 12px;
		font-weight: 600;
		border-radius: 4px;
		border: 2px solid var(--interactive-accent);
		background: var(--interactive-accent);
		color: white;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.death-save-roll-button:hover:not(:disabled) {
		background: var(--interactive-accent-hover);
		border-color: var(--interactive-accent-hover);
	}

	.death-save-roll-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Always horizontal layout when side by side with hit dice */
	.death-saves-container {
		flex-direction: row;
		align-items: center;
		padding: 6px 8px;
		gap: 8px;
	}

	.death-saves-circles-wrapper {
		align-items: flex-start;
	}

	.death-save-circle {
		width: 18px;
		height: 18px;
		font-size: 12px;
	}

	.death-save-roll-button {
		width: auto;
		padding: 4px;
		flex-shrink: 0;
	}
</style>
