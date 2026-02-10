<script lang="ts">
	import type { EntityLinkResult } from '../../../../domain/services/EntityLinkService';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import AutocompleteInput from '../../uikit/AutocompleteInput.svelte';

	interface Item {
		name: { rus: string; eng: string };
		url: string;
	}

	interface Props {
		value: string;
		placeholder?: string;
		onchange?: (value: string) => void;
		onLookup?: (value: string) => Promise<EntityLinkResult>;
		uiEventListener?: IUiEventListener;
		// Autocomplete props
		autocompleteItems?: Item[];
		onAutocompleteSelect?: (item: Item) => void;
	}

	let {
		value = '',
		placeholder = '',
		onchange,
		onLookup,
		uiEventListener,
		autocompleteItems,
		onAutocompleteSelect
	}: Props = $props();
	let linkResult = $state<EntityLinkResult | null>(null);
	let lookupTimeout: NodeJS.Timeout | null = null;

	// Determine if we should show autocomplete
	const hasAutocomplete = $derived(!!autocompleteItems && autocompleteItems.length > 0);

	// Initial lookup when component mounts with existing value
	$effect(() => {
		if (onLookup && value.trim()) {
			onLookup(value.trim()).then(result => {
				linkResult = result;
			});
		}
	});

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

	async function handleLinkClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		if (!linkResult?.exists || !linkResult.url || !uiEventListener) return;

		const url = linkResult.url;

		// Determine which listener to call based on URL pattern
		if (url.includes('/races/')) {
			await uiEventListener.onRaceClick(url);
		} else if (url.includes('/classes/')) {
			await uiEventListener.onClassClick(url);
		} else if (url.includes('/backgrounds/')) {
			await uiEventListener.onBackgroundClick(url);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleLinkClick(event as any);
		}
	}

	async function handleAutocompleteSelect(item: Item) {
		onchange?.(item.name.rus);
		onAutocompleteSelect?.(item);

		// Trigger lookup after selection
		if (onLookup) {
			linkResult = await onLookup(item.name.rus);
		}
	}
</script>

<div class="linked-input-container">
	{#if hasAutocomplete && autocompleteItems}
		<AutocompleteInput
			bind:value={value}
			{placeholder}
			items={autocompleteItems}
			onchange={(newValue) => {
				onchange?.(newValue);
				// Debounced lookup for manual typing
				if (lookupTimeout) clearTimeout(lookupTimeout);
				if (onLookup && newValue.trim()) {
					lookupTimeout = setTimeout(async () => {
						linkResult = await onLookup(newValue.trim());
					}, 500);
				} else {
					linkResult = null;
				}
			}}
			onSelect={handleAutocompleteSelect}
		/>
	{:else}
		<input
			type="text"
			{value}
			{placeholder}
			oninput={handleInput}
			onblur={handleBlur}
			class="linked-input"
			class:has-link={linkResult?.exists}
		/>
	{/if}
	{#if linkResult?.exists}
		<span
			class="link-indicator"
			class:clickable={!!uiEventListener}
			title="Найдено в базе данных: {linkResult.name?.rus}"
			onclick={handleLinkClick}
			onkeydown={handleKeydown}
			role="button"
			tabindex="0"
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
		transition: all 0.2s;
	}

	.link-indicator.clickable {
		cursor: pointer;
		pointer-events: auto;
	}

	.link-indicator.clickable:hover {
		opacity: 1;
		transform: scale(1.15);
	}
</style>
