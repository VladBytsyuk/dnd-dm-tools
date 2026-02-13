<script lang="ts">
	import { ALIGNMENTS } from '../../../../domain/models/character/Alignment';

	interface Props {
		value: string;
		onchange?: (value: string) => void;
	}

	let { value = 'true-neutral', onchange }: Props = $props();

	function handleChange(event: Event) {
		const newValue = (event.target as HTMLSelectElement).value;
		onchange?.(newValue);
	}
</script>

<select class="alignment-picker" {value} onchange={handleChange}>
	{#each ALIGNMENTS as alignment}
		<option value={alignment.value}>{alignment.label}</option>
	{/each}
</select>

<style>
	.alignment-picker {
		padding: 0px 2px;
		font-size: inherit;
		border: 1px solid transparent;
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-normal);
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
		line-height: 1.3;
	}

	.alignment-picker:hover {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.alignment-picker:focus {
		outline: none;
		background-color: var(--background-primary);
		border-color: var(--text-accent);
		box-shadow: 0 0 0 1px var(--background-modifier-border-focus);
	}
</style>
