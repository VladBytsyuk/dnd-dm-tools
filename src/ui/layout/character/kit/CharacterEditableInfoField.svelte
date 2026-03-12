<script lang="ts">
	interface Props {
		label: string;
		value?: string;
		placeholder?: string;
		onChange: (value: string) => void;
	}

	let {
		label,
		value = "",
		placeholder = "",
		onChange
	}: Props = $props();

	function handleInput(event: Event) {
		onChange((event.currentTarget as HTMLInputElement).value);
	}
</script>

<label class="character-editable-info-field">
	<span class="field-label">{label}</span>
	<input
		type="text"
		class="field-input"
		value={value}
		placeholder={placeholder}
		oninput={handleInput}
	/>
</label>

<style>
	.character-editable-info-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--text-muted);
	}

	.field-input {
		width: 100%;
		height: 30px;
		padding: 4px 8px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		background-color: var(--background-primary);
		color: var(--text-normal);
		font-size: 12px;
		box-sizing: border-box;
	}

	.field-input:focus {
		outline: none;
		border-color: var(--interactive-accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--interactive-accent) 20%, transparent);
	}
</style>
