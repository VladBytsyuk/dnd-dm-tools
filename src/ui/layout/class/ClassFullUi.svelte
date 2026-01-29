<script lang="ts">
    import type { FullClass } from '../../../domain/models/class/FullClass';
    import type { SmallClass } from '../../../domain/models/class/SmallClass';
    import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
    import type { ClassesRepository } from '../../../data/repositories/ClassesRepository';
    import HeaderFullUi from '../uikit/HeaderFullUi.svelte';
    import HtmlBlock from '../uikit/HtmlBlock.svelte';
    import { copyClassToClipboard } from '../../../data/clipboard';
    import { onMount, onDestroy } from 'svelte';
    import { DiceRollersManager } from '../dice-roller/DiceRollersManager';

    let {
        currentItem,
        repository,
        uiEventListener,
    } = $props<{
        currentItem: FullClass;
        repository?: ClassesRepository;
        uiEventListener: IUiEventListener;
    }>();

    // State for archetypes (only for base classes)
    let archetypes = $state<SmallClass[]>([]);
    let isDropdownOpen = $state(false);

    // Dice rollers manager
    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

    // Load archetypes when component mounts (only for base classes)
    onMount(async () => {
        diceRollersManager.onMount();
        if (repository && !currentItem.isArchetype) {
            archetypes = await repository.getArchetypesForClass(currentItem.url);
        }
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

    // Group archetypes by type
    const groupedArchetypes = $derived(() => {
        const groups = new Map<string, SmallClass[]>();
        archetypes.forEach((archetype: SmallClass) => {
            // Extract type from archetype URL or use default
            const typeName = "Архетипы"; // Default group name
            if (!groups.has(typeName)) {
                groups.set(typeName, []);
            }
            groups.get(typeName)!.push(archetype);
        });
        return Array.from(groups.entries());
    });

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleArchetypeClick(e: MouseEvent, archetype: SmallClass) {
        e.preventDefault();
        e.stopPropagation();
        isDropdownOpen = false;
        uiEventListener.onClassClick(archetype.url);
    }

    function handleBackToParent(e: MouseEvent) {
        if (currentItem.parentClassUrl) {
            e.preventDefault();
            uiEventListener.onClassClick(currentItem.parentClassUrl);
        }
    }
</script>

<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        source={currentItem.source}
        onClick={() => copyClassToClipboard(currentItem)}
    />

    {#if currentItem.isArchetype && currentItem.parentClassUrl}
        <div class="parent-class-link">
            <a
                href={currentItem.parentClassUrl}
                onclick={handleBackToParent}
                class="back-link"
            >
                ← Назад к базовому классу
            </a>
        </div>
    {/if}

    {#if !currentItem.isArchetype && archetypes.length > 0}
        <div class="archetype-selector">
            <button
                class="archetype-selector__button"
                onclick={toggleDropdown}
                type="button"
            >
                <span class="archetype-selector__label">
                    Выберите архетип ({archetypes.length})
                </span>
                <span class="archetype-selector__arrow" class:open={isDropdownOpen}>▼</span>
            </button>

            {#if isDropdownOpen}
                <div class="archetype-dropdown">
                    {#each groupedArchetypes() as [typeName, archetypeList]}
                        <div class="archetype-group">
                            <h4 class="archetype-group__title">{typeName}</h4>
                            <div class="archetype-list">
                                {#each archetypeList as archetype}
                                    <div class="archetype-item">
                                        <a
                                            href={archetype.url}
                                            class="archetype-item__link"
                                            onclick={(e) => handleArchetypeClick(e, archetype)}
                                        >
                                            <span class="archetype-item__name">
                                                {archetype.name.rus}
                                                <span class="archetype-item__eng">({archetype.name.eng})</span>
                                            </span>
                                            <span class="archetype-item__source">{archetype.source.shortName}</span>
                                        </a>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    <div class="class-details__content">
        {#if currentItem.associatedHtml}
            <div class="class-html-content">
                <HtmlBlock htmlContent={currentItem.associatedHtml} uiEventListener={uiEventListener} />
            </div>
        {:else}
            <div class="class-loading">
                <p>Загрузка содержимого...</p>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Parent class link */
    .parent-class-link {
        padding: 12px;
        border-bottom: 1px solid var(--background-modifier-border);
        background-color: var(--background-secondary);
    }

    .back-link {
        color: var(--text-accent);
        text-decoration: none;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    /* Archetype Selector */
    .archetype-selector {
        position: relative;
        padding: 12px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .archetype-selector__button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background-color: var(--background-secondary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        cursor: pointer;
        color: var(--text-normal);
        font-size: 1em;
        transition: background-color 0.2s;
    }

    .archetype-selector__button:hover {
        background-color: var(--background-modifier-hover);
    }

    .archetype-selector__label {
        flex: 1;
        text-align: left;
    }

    .archetype-selector__arrow {
        margin-left: 8px;
        transition: transform 0.2s;
        font-size: 0.8em;
    }

    .archetype-selector__arrow.open {
        transform: rotate(180deg);
    }

    /* Dropdown */
    .archetype-dropdown {
        position: absolute;
        top: 100%;
        left: 12px;
        right: 12px;
        margin-top: 4px;
        background-color: var(--background-primary);
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        padding: 8px;
    }

    .archetype-group {
        margin-bottom: 12px;
    }

    .archetype-group:last-child {
        margin-bottom: 0;
    }

    .archetype-group__title {
        font-size: 0.9em;
        font-weight: 600;
        margin-bottom: 6px;
        padding: 4px 8px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .archetype-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .archetype-item {
        display: flex;
        align-items: center;
        border-radius: 4px;
        overflow: hidden;
    }

    .archetype-item__link {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: none;
        text-decoration: none;
        color: var(--text-normal);
        transition: background-color 0.2s;
    }

    .archetype-item__link:hover {
        background-color: var(--background-modifier-hover);
    }

    .archetype-item__name {
        flex: 1;
    }

    .archetype-item__eng {
        color: var(--text-muted);
        font-size: 0.9em;
        margin-left: 4px;
    }

    .archetype-item__source {
        font-size: 0.85em;
        color: var(--text-muted);
        padding: 2px 6px;
        background-color: var(--background-secondary);
        border-radius: 3px;
        margin-left: 8px;
    }

    /* HTML content */
    .class-html-content {
        margin-top: 16px;
    }

    .class-loading {
        margin-top: 16px;
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
    }
</style>
