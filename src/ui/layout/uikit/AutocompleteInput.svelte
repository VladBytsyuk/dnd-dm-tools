<script lang="ts" generics="T extends { name: { rus: string; eng: string } }">
	interface Props {
		value: string;
		placeholder?: string;
		items: T[];
		onchange?: (value: string) => void;
		onSelect?: (item: T) => void;
		disabled?: boolean;
		filterFn?: (item: T, query: string) => boolean;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		items = [],
		onchange,
		onSelect,
		disabled = false,
		filterFn
	}: Props = $props();

	let showDropdown = $state(false);
	let filteredItems = $state<T[]>([]);
	let selectedIndex = $state(0);
	let inputElement: HTMLInputElement | undefined = $state();
	let containerElement: HTMLDivElement | undefined = $state();

	// Default filter function: search both Russian and English names
	const defaultFilterFn = (item: T, query: string): boolean => {
		const rusName = item.name.rus.toLowerCase();
		const engName = item.name.eng.toLowerCase();
		const lowerQuery = query.toLowerCase().trim();
		return rusName.includes(lowerQuery) || engName.includes(lowerQuery);
	};

	const activeFilterFn = filterFn || defaultFilterFn;

	function handleFocus() {
		if (disabled) return;
		showDropdown = true;
		filterItems(value);
	}

	function handleInput(event: Event) {
		const newValue = (event.target as HTMLInputElement).value;
		value = newValue;
		onchange?.(newValue);
		filterItems(newValue);
	}

	function filterItems(query: string) {
		if (!query.trim()) {
			filteredItems = items;
		} else {
			filteredItems = items.filter(item => activeFilterFn(item, query));
		}
		selectedIndex = 0;
	}

	function selectItem(item: T) {
		value = item.name.rus;
		onchange?.(item.name.rus);
		onSelect?.(item);
		closeDropdown();
		inputElement?.blur();
	}

	function closeDropdown() {
		showDropdown = false;
		selectedIndex = 0;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showDropdown) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
				scrollToSelectedItem();
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				scrollToSelectedItem();
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredItems[selectedIndex]) {
					selectItem(filteredItems[selectedIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				closeDropdown();
				inputElement?.blur();
				break;
		}
	}

	function scrollToSelectedItem() {
		// Scroll selected item into view in dropdown
		const dropdownEl = containerElement?.querySelector('.dropdown-list');
		const selectedEl = containerElement?.querySelector('.dropdown-item.selected');
		if (dropdownEl && selectedEl) {
			const dropdownRect = dropdownEl.getBoundingClientRect();
			const selectedRect = selectedEl.getBoundingClientRect();

			if (selectedRect.bottom > dropdownRect.bottom) {
				selectedEl.scrollIntoView({ block: 'nearest' });
			} else if (selectedRect.top < dropdownRect.top) {
				selectedEl.scrollIntoView({ block: 'nearest' });
			}
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (containerElement && !containerElement.contains(event.target as Node)) {
			closeDropdown();
		}
	}

	// Setup click-outside listener
	$effect(() => {
		if (showDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	});
</script>

<div class="autocomplete-container" bind:this={containerElement}>
	<input
		type="text"
		bind:this={inputElement}
		bind:value={value}
		{placeholder}
		{disabled}
		class="autocomplete-input"
		onfocus={handleFocus}
		oninput={handleInput}
		onkeydown={handleKeydown}
		autocomplete="off"
	/>
	{#if showDropdown && filteredItems.length > 0}
		<div class="dropdown-list" role="listbox">
			{#each filteredItems as item, index}
				<div
					class="dropdown-item"
					class:selected={index === selectedIndex}
					role="option"
					aria-selected={index === selectedIndex}
					tabindex="-1"
					onclick={() => selectItem(item)}
					onmouseenter={() => selectedIndex = index}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							selectItem(item);
						}
					}}
				>
					{item.name.rus}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.autocomplete-container {
		position: relative;
		width: 100%;
	}

	.autocomplete-input {
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

	.autocomplete-input:hover:not(:disabled) {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.autocomplete-input:focus {
		outline: none;
		background-color: var(--background-primary);
		border-color: var(--text-accent);
		box-shadow: 0 0 0 1px var(--background-modifier-border-focus);
	}

	.autocomplete-input:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.dropdown-list {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		right: 0;
		max-height: 200px;
		overflow-y: auto;
		background-color: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 100;
	}

	.dropdown-item {
		padding: 4px 8px;
		cursor: pointer;
		transition: background-color 0.1s;
		font-size: inherit;
		color: var(--text-normal);
	}

	.dropdown-item:hover,
	.dropdown-item.selected {
		background-color: var(--background-modifier-hover);
	}

	.dropdown-item:active {
		background-color: var(--background-modifier-active-hover);
	}
</style>
