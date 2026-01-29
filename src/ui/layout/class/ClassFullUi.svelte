<script lang="ts">
    import type { FullClass, Archetype } from '../../../domain/models/class/FullClass';
    import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
    import HeaderFullUi from '../uikit/HeaderFullUi.svelte';
    import { copyClassToClipboard } from '../../../data/clipboard';

    let {
        currentItem,
        uiEventListener,
    } = $props<{
        currentItem: FullClass;
        uiEventListener: IUiEventListener;
    }>();

    // State for selected archetype and dropdown
    let selectedArchetype = $state<Archetype | null>(null);
    let isDropdownOpen = $state(false);

    // Group archetypes by type
    const groupedArchetypes = $derived(() => {
        const groups = new Map<string, Archetype[]>();
        currentItem.archetypes.forEach((archetype: Archetype) => {
            const typeName = archetype.type.name;
            if (!groups.has(typeName)) {
                groups.set(typeName, []);
            }
            groups.get(typeName)!.push(archetype);
        });

        // Sort groups by order
        return Array.from(groups.entries())
            .sort((a, b) => {
                const orderA = currentItem.archetypes.find((arch: Archetype) => arch.type.name === a[0])?.type.order ?? 0;
                const orderB = currentItem.archetypes.find((arch: Archetype) => arch.type.name === b[0])?.type.order ?? 0;
                return orderA - orderB;
            });
    });

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function selectArchetype(archetype: Archetype) {
        selectedArchetype = archetype;
        isDropdownOpen = false;
    }

    function handleArchetypeClick(e: MouseEvent, archetype: Archetype) {
        e.preventDefault();
        e.stopPropagation();
        uiEventListener.onClassClick(archetype.url);
    }
</script>

<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        source={currentItem.source}
        onClick={() => copyClassToClipboard(currentItem)}
    />

    {#if currentItem.archetypes.length > 0}
        <div class="archetype-selector">
            <button
                class="archetype-selector__button"
                onclick={toggleDropdown}
                type="button"
            >
                <span class="archetype-selector__label">
                    {#if selectedArchetype}
                        {selectedArchetype.name.rus}
                        <span class="archetype-selector__eng">({selectedArchetype.name.eng})</span>
                    {:else}
                        Выберите архетип
                    {/if}
                </span>
                <span class="archetype-selector__arrow" class:open={isDropdownOpen}>▼</span>
            </button>

            {#if isDropdownOpen}
                <div class="archetype-dropdown">
                    {#each groupedArchetypes() as [typeName, archetypes]}
                        <div class="archetype-group">
                            <h4 class="archetype-group__title">{typeName}</h4>
                            <div class="archetype-list">
                                {#each archetypes as archetype}
                                    <div
                                        class="archetype-item"
                                        class:selected={selectedArchetype?.url === archetype.url}
                                    >
                                        <button
                                            class="archetype-item__button"
                                            onclick={() => selectArchetype(archetype)}
                                            type="button"
                                        >
                                            <span class="archetype-item__name">
                                                {archetype.name.rus}
                                                <span class="archetype-item__eng">({archetype.name.eng})</span>
                                            </span>
                                            <span class="archetype-item__source">{archetype.source.shortName}</span>
                                        </button>
                                        <a
                                            href={archetype.url}
                                            class="archetype-item__link"
                                            onclick={(e) => handleArchetypeClick(e, archetype)}
                                            title="Открыть архетип"
                                        >
                                            →
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
        <div class="class-info">
            <div class="class-info__row">
                <span class="class-info__label">Хит-дайс:</span>
                <span class="class-info__value">{currentItem.dice}</span>
            </div>
        </div>

        {#if selectedArchetype}
            <div class="selected-archetype-info">
                <h3>Выбранный архетип: {selectedArchetype.name.rus}</h3>
                <p class="selected-archetype-info__description">
                    <a
                        href={selectedArchetype.url}
                        class="internal-link"
                        onclick={(e) => handleArchetypeClick(e, selectedArchetype!)}
                    >
                        Перейти к описанию архетипа
                    </a>
                </p>
            </div>
        {/if}
    </div>
</div>

<style>
    .class-details__content {
        padding: 12px;
    }

    .class-info {
        margin-bottom: 16px;
    }

    .class-info__row {
        display: flex;
        gap: 8px;
        margin-bottom: 4px;
    }

    .class-info__label {
        font-weight: 600;
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

    .archetype-selector__eng {
        color: var(--text-muted);
        font-size: 0.9em;
        margin-left: 4px;
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
        gap: 4px;
        border-radius: 4px;
        overflow: hidden;
    }

    .archetype-item.selected {
        background-color: var(--background-modifier-hover);
    }

    .archetype-item__button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-normal);
        text-align: left;
        transition: background-color 0.2s;
    }

    .archetype-item__button:hover {
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

    .archetype-item__link {
        padding: 8px 12px;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 1.2em;
        line-height: 1;
        transition: color 0.2s;
    }

    .archetype-item__link:hover {
        color: var(--text-accent);
    }

    /* Selected Archetype Info */
    .selected-archetype-info {
        margin-top: 16px;
        padding: 12px;
        background-color: var(--background-secondary);
        border-radius: 6px;
        border-left: 3px solid var(--text-accent);
    }

    .selected-archetype-info h3 {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .selected-archetype-info__description {
        margin: 0;
    }

    .selected-archetype-info__description .internal-link {
        color: var(--text-accent);
        text-decoration: none;
    }

    .selected-archetype-info__description .internal-link:hover {
        text-decoration: underline;
    }
</style>
