<script lang="ts">
	/**
	 * Reusable circular stat display component with title and editable value
	 */
	interface Props {
		value: number | string;
		label: string;
		title: string;
		isEditable?: boolean;
		onChange?: (value: number) => void;
	}

	let { value, label, title, isEditable = false, onChange }: Props = $props();

	let inputValue = $state(String(value));
	let inputEl: HTMLInputElement | null = $state(null);

	// Sync input value when prop changes
	$effect(() => {
		inputValue = String(value);
	});

	function handleChange() {
		if (!onChange || !isEditable) return;
		const numValue = Number(inputValue);
		if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
			onChange(Math.floor(numValue));
		} else {
			inputValue = String(value); // Reset to previous value
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			(e.target as HTMLInputElement).blur();
		} else if (e.key === "Escape") {
			inputValue = String(value);
			(e.target as HTMLInputElement).blur();
		}
	}
</script>

<div class="stat-circle-container" {title}>
	<div class="stat-label">{label}</div>
	<div class="stat-circle">
		{#if isEditable}
			<input
				bind:this={inputEl}
				bind:value={inputValue}
				type="text"
				class="stat-input"
				onblur={handleChange}
				onkeydown={handleKeydown}
			/>
		{:else}
			<div class="stat-value">{value}</div>
		{/if}
	</div>
</div>

<style>
	.stat-circle-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.stat-label {
		font-size: 8px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 50px;
	}

	.stat-circle {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background-color: var(--background-secondary);
		border: 2px solid var(--background-modifier-border);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.stat-value {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-normal);
		line-height: 1;
		text-align: center;
	}

	.stat-input {
		width: 42px;
		height: 42px;
		text-align: center;
		font-size: 14px;
		font-weight: 700;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--text-normal);
		padding: 0;
	}

	.stat-input:focus {
		outline: none;
		background: var(--background-primary);
	}

	.stat-input:hover {
		background: var(--background-primary-alt);
	}
</style>
