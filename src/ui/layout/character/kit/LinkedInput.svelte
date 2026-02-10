<script lang="ts">
	import type { EntityLinkResult } from '../../../../domain/services/EntityLinkService';

	interface Props {
		value: string;
		placeholder?: string;
		onchange?: (value: string) => void;
		onLookup?: (value: string) => Promise<EntityLinkResult>;
	}

	let { value = '', placeholder = '', onchange, onLookup }: Props = $props();
	let linkResult = $state<EntityLinkResult | null>(null);
	let lookupTimeout: NodeJS.Timeout | null = null;

	function handleInput(event: Event) {
		const newValue = (event.target as HTMLInputElement).value;
		onchange?.(newValue);

		// Debounced lookup
		if (lookupTimeout) clearTimeout(lookupTimeout);

		if (onLookup && newValue.trim()) {
			lookupTimeout = setTimeout(async () => {
				linkResult = await onLookup(newValue.trim());
			}, 500); // 500ms debounce
		} else {
			linkResult = null;
		}
	}

	async function handleBlur() {
		// Immediate lookup on blur
		if (onLookup && value.trim()) {
			linkResult = await onLookup(value.trim());
		}
	}
</script>

<div class="linked-input-container">
	<input
		type="text"
		{value}
		{placeholder}
		oninput={handleInput}
		onblur={handleBlur}
		class="linked-input"
		class:has-link={linkResult?.exists}
	/>
	{#if linkResult?.exists}
		<span
			class="link-indicator"
			title="Найдено в базе данных: {linkResult.name?.rus}"
		>🔗</span>
	{/if}
</div>

<style>
	.linked-input-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
		width: 100%;
	}

	.linked-input {
		flex: 1;
		padding: 0px 2px;
		font-size: inherit;
		border: 1px solid transparent;
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-normal);
		transition: all 0.2s;
		width: 100%;
		line-height: 1.3;
	}

	.linked-input::placeholder {
		color: var(--text-faint);
		opacity: 0.5;
	}

	.linked-input:hover {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.linked-input:focus {
		outline: none;
		background-color: var(--background-primary);
		border-color: var(--text-accent);
		box-shadow: 0 0 0 1px var(--background-modifier-border-focus);
	}

	.linked-input.has-link {
		padding-right: 18px; /* Make room for link icon */
	}

	.link-indicator {
		position: absolute;
		right: 3px;
		font-size: 11px;
		cursor: help;
		opacity: 0.7;
		pointer-events: none;
	}
</style>
