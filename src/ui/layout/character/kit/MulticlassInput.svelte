<script lang="ts">
	import type { ClassEntry } from '../../../../domain/models/character/ClassEntry';
	import type { EntityLinkResult } from '../../../../domain/services/EntityLinkService';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import AutocompleteInput from '../../uikit/AutocompleteInput.svelte';

	interface ClassOption {
		name: { rus: string; eng: string };
		url: string;
	}

	interface ArchetypeOption {
		name: { rus: string; eng: string };
		url: string;
		parentClassUrl: string;
	}

	interface Props {
		classes: ClassEntry[];
		onchange?: (classes: ClassEntry[]) => void;
		onLookupClass?: (className: string) => Promise<EntityLinkResult>;
		onLookupSubclass?: (subclassName: string) => Promise<EntityLinkResult>;
		uiEventListener?: IUiEventListener;
		classOptions?: ClassOption[];
		archetypeOptions?: ArchetypeOption[];
	}

	let { classes = [], onchange, onLookupClass, onLookupSubclass, uiEventListener, classOptions, archetypeOptions }: Props = $props();
	let classLinks = $state<(EntityLinkResult | null)[]>([]);
	let subclassLinks = $state<(EntityLinkResult | null)[]>([]);

	// Initial lookup for all classes when component mounts or classes change
	$effect(() => {
		if (onLookupClass) {
			classes.forEach((classEntry, index) => {
				if (classEntry.className.trim()) {
					checkClassLink(index, classEntry.className);
				}
			});
		}
	});

	// Initial lookup for all subclasses when component mounts or classes change
	$effect(() => {
		if (onLookupSubclass) {
			classes.forEach((classEntry, index) => {
				if (classEntry.subclassName?.trim()) {
					checkSubclassLink(index, classEntry.subclassName);
				}
			});
		}
	});

	async function checkClassLink(index: number, className: string) {
		if (onLookupClass && className.trim()) {
			classLinks[index] = await onLookupClass(className.trim());
		} else {
			classLinks[index] = null;
		}
	}

	async function checkSubclassLink(index: number, subclassName: string) {
		if (onLookupSubclass && subclassName.trim()) {
			subclassLinks[index] = await onLookupSubclass(subclassName.trim());
		} else {
			subclassLinks[index] = null;
		}
	}

	async function handleLinkClick(event: MouseEvent, index: number) {
		event.preventDefault();
		event.stopPropagation();

		const linkResult = classLinks[index];
		if (!linkResult?.exists || !linkResult.url || !uiEventListener) return;

		const url = linkResult.url;
		if (url.includes('/classes/')) {
			await uiEventListener.onClassClick(url);
		}
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleLinkClick(event as any, index);
		}
	}

	async function handleSubclassLinkClick(event: MouseEvent, index: number) {
		event.preventDefault();
		event.stopPropagation();

		const linkResult = subclassLinks[index];
		if (!linkResult?.exists || !linkResult.url || !uiEventListener) return;

		const url = linkResult.url;
		// Archetypes use /classes/ URL pattern, same as base classes
		if (url.includes('/classes/')) {
			await uiEventListener.onClassClick(url);
		}
	}

	function handleSubclassLinkKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSubclassLinkClick(event as any, index);
		}
	}

	function addClass() {
		const updated = [...classes, { className: '', level: 1 }];
		onchange?.(updated);
	}

	function removeClass(index: number) {
		const updated = classes.filter((_, i) => i !== index);
		onchange?.(updated);
	}

	function updateClass(index: number, field: keyof ClassEntry, value: any) {
		const updated = [...classes];
		updated[index] = { ...updated[index], [field]: value };
		onchange?.(updated);

		if (field === 'className') {
			checkClassLink(index, value);
		} else if (field === 'subclassName') {
			checkSubclassLink(index, value);
		}
	}

	// Calculate total level
	const totalLevel = $derived(classes.reduce((sum, c) => sum + (c.level || 0), 0));
	const isMaxLevel = $derived(totalLevel >= 20);

	// Check if autocomplete is available
	const hasAutocomplete = $derived(!!classOptions && classOptions.length > 0);
	const hasArchetypeAutocomplete = $derived(!!archetypeOptions && archetypeOptions.length > 0);

	// Get filtered archetype options for a specific class entry
	function getArchetypeOptionsForClass(index: number): ArchetypeOption[] {
		if (!archetypeOptions || !classLinks[index]?.url) return [];

		const classUrl = classLinks[index].url;
		return archetypeOptions.filter(archetype => archetype.parentClassUrl === classUrl);
	}

	async function handleAutocompleteSelect(index: number, item: ClassOption) {
		updateClass(index, 'className', item.name.rus);
		await checkClassLink(index, item.name.rus);
	}

	async function handleArchetypeAutocompleteSelect(index: number, item: ArchetypeOption) {
		updateClass(index, 'subclassName', item.name.rus);
		await checkSubclassLink(index, item.name.rus);
	}
</script>

<div class="multiclass-input">
	<div class="classes-container">
		<div class="classes-list">
			{#each classes as classEntry, index}
				<div class="class-entry">
					<div class="class-name-wrapper">
						{#if hasAutocomplete && classOptions}
							<AutocompleteInput
								value={classEntry.className}
								placeholder="Класс"
								items={classOptions}
								onchange={(newValue) => {
									updateClass(index, 'className', newValue);
								}}
								onSelect={(item) => handleAutocompleteSelect(index, item)}
							/>
						{:else}
							<input
								type="text"
								placeholder="Класс"
								value={classEntry.className}
								oninput={(e) => updateClass(index, 'className', e.currentTarget.value)}
								onblur={(e) => checkClassLink(index, e.currentTarget.value)}
								class="class-name-input"
							/>
						{/if}
						{#if classLinks[index]?.exists}
							<span
								class="link-icon"
								class:clickable={!!uiEventListener}
								title="Найдено в базе"
								onclick={(e) => handleLinkClick(e, index)}
								onkeydown={(e) => handleKeydown(e, index)}
								role="button"
								tabindex="0"
							>🔗</span>
						{/if}
					</div>
					<div class="subclass-wrapper">
						{#if hasArchetypeAutocomplete && archetypeOptions}
							{@const filteredArchetypes = getArchetypeOptionsForClass(index)}
							{#if filteredArchetypes.length > 0}
								<AutocompleteInput
									value={classEntry.subclassName || ''}
									placeholder="Подкласс"
									items={filteredArchetypes}
									onchange={(newValue) => {
										updateClass(index, 'subclassName', newValue);
									}}
									onSelect={(item) => handleArchetypeAutocompleteSelect(index, item)}
								/>
							{:else}
								<input
									type="text"
									placeholder="Подкласс"
									value={classEntry.subclassName || ''}
									oninput={(e) => updateClass(index, 'subclassName', e.currentTarget.value)}
									onblur={(e) => checkSubclassLink(index, e.currentTarget.value)}
									class="subclass-input"
								/>
							{/if}
						{:else}
							<input
								type="text"
								placeholder="Подкласс"
								value={classEntry.subclassName || ''}
								oninput={(e) => updateClass(index, 'subclassName', e.currentTarget.value)}
								onblur={(e) => checkSubclassLink(index, e.currentTarget.value)}
								class="subclass-input"
								class:has-link={subclassLinks[index]?.exists}
							/>
						{/if}
						{#if subclassLinks[index]?.exists}
							<span
								class="link-icon"
								class:clickable={!!uiEventListener}
								title="Найдено в базе: {subclassLinks[index].name?.rus}"
								onclick={(e) => handleSubclassLinkClick(e, index)}
								onkeydown={(e) => handleSubclassLinkKeydown(e, index)}
								role="button"
								tabindex="0"
							>🔗</span>
						{/if}
					</div>
					<input
						type="number"
						min="1"
						max="20"
						value={classEntry.level}
						oninput={(e) => updateClass(index, 'level', parseInt(e.currentTarget.value) || 1)}
						class="level-input"
					/>
					{#if classes.length > 1}
						<button
							class="remove-btn"
							onclick={() => removeClass(index)}
							title="Удалить класс"
							type="button"
						>×</button>
					{/if}
				</div>
			{/each}
		</div>
		<button
			class="add-class-btn"
			onclick={addClass}
			disabled={isMaxLevel}
			title={isMaxLevel ? "Достигнут максимальный уровень (20)" : "Добавить класс"}
			type="button"
		>+</button>
	</div>
	{#if totalLevel > 20}
		<div class="error-message">Общий уровень не может превышать 20</div>
	{/if}
</div>

<style>
	.multiclass-input {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
	}

	.classes-container {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	.classes-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.class-entry {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
	}

	.class-name-wrapper {
		position: relative;
		flex: 2;
		display: flex;
		align-items: center;
	}

	.class-name-wrapper :global(.autocomplete-container) {
		flex: 1;
	}

	.class-name-wrapper :global(.autocomplete-input) {
		padding-right: 18px; /* Space for link icon */
		font-weight: 600;
		font-size: 11px;
	}

	.class-name-input,
	.subclass-input,
	.level-input {
		padding: 0px 3px;
		font-size: 11px;
		border: 1px solid transparent;
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-normal);
		transition: all 0.2s;
		line-height: 1.3;
	}

	.class-name-input::placeholder,
	.subclass-input::placeholder {
		color: var(--text-faint);
		opacity: 0.5;
	}

	.class-name-input {
		flex: 1;
		padding-right: 18px; /* Space for link icon */
		font-weight: 600;
	}

	.class-name-input:hover,
	.subclass-input:hover,
	.level-input:hover {
		background-color: var(--background-primary-alt);
		border-color: var(--background-modifier-border);
	}

	.class-name-input:focus,
	.subclass-input:focus,
	.level-input:focus {
		outline: none;
		background-color: var(--background-primary);
		border-color: var(--text-accent);
		box-shadow: 0 0 0 1px var(--background-modifier-border-focus);
	}

	.subclass-wrapper {
		position: relative;
		flex: 2;
		display: flex;
		align-items: center;
	}

	.subclass-wrapper :global(.autocomplete-container) {
		flex: 1;
	}

	.subclass-wrapper :global(.autocomplete-input) {
		padding-right: 18px; /* Space for link icon */
		font-style: italic;
		color: var(--text-muted);
		font-size: 11px;
	}

	.subclass-input {
		flex: 1;
		font-style: italic;
		color: var(--text-muted);
	}

	.subclass-input.has-link {
		padding-right: 18px; /* Make room for link icon */
	}

	/* Link icon styles for subclass wrapper */
	.subclass-wrapper .link-icon {
		position: absolute;
		right: 3px;
		font-size: 10px;
		pointer-events: none;
		opacity: 0.7;
		transition: all 0.2s;
		cursor: help;
	}

	.subclass-wrapper .link-icon.clickable {
		cursor: pointer;
		pointer-events: auto;
	}

	.subclass-wrapper .link-icon.clickable:hover {
		opacity: 1;
		transform: scale(1.15);
	}

	.level-input {
		width: 45px;
		text-align: center;
		font-weight: 600;
	}

	.link-icon {
		position: absolute;
		right: 3px;
		font-size: 10px;
		pointer-events: none;
		opacity: 0.7;
		transition: all 0.2s;
		cursor: help;
	}

	.link-icon.clickable {
		cursor: pointer;
		pointer-events: auto;
	}

	.link-icon.clickable:hover {
		opacity: 1;
		transform: scale(1.15);
	}

	.remove-btn {
		width: 16px;
		height: 16px;
		padding: 0;
		border: 1px solid var(--background-modifier-border);
		border-radius: 2px;
		background-color: var(--background-primary);
		color: var(--text-error);
		font-size: 13px;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.remove-btn:hover {
		background-color: var(--background-modifier-error);
	}

	.add-class-btn {
		width: 16px;
		height: 16px;
		padding: 0;
		font-size: 12px;
		line-height: 1;
		border: 1px dashed var(--background-modifier-border);
		border-radius: 2px;
		background-color: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-class-btn:hover:not(:disabled) {
		border-style: solid;
		border-color: var(--text-accent);
		color: var(--text-accent);
		background-color: var(--background-primary-alt);
	}

	.add-class-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-message {
		color: var(--text-error);
		font-size: 9px;
		padding: 2px 4px;
		background-color: var(--background-modifier-error);
		border-radius: 2px;
	}
</style>
