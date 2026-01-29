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
</script>

<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        source={currentItem.source}
        onClick={() => copyClassToClipboard(currentItem)}
    />

    <div class="class-details__content">
        <div class="class-info">
            <div class="class-info__row">
                <span class="class-info__label">Хит-дайс:</span>
                <span class="class-info__value">{currentItem.dice}</span>
            </div>
        </div>

        {#if currentItem.archetypes.length > 0}
            <div class="class-archetypes">
                <h3>Архетипы</h3>
                {#each groupedArchetypes() as [typeName, archetypes]}
                    <div class="archetype-group">
                        <h4 class="archetype-group__title">{typeName}</h4>
                        <div class="archetype-list">
                            {#each archetypes as archetype}
                                <div class="archetype-item">
                                    <a
                                        href={archetype.url}
                                        class="archetype-item__name internal-link"
                                        onclick={(e) => {
                                            e.preventDefault();
                                            uiEventListener.onClassClick(archetype.url);
                                        }}
                                    >
                                        {archetype.name.rus}
                                        <span class="archetype-item__eng">({archetype.name.eng})</span>
                                    </a>
                                    <span class="archetype-item__source">{archetype.source.shortName}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
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

    .class-archetypes {
        margin-top: 20px;
    }

    .class-archetypes h3 {
        font-size: 1.2em;
        font-weight: 600;
        margin-bottom: 12px;
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 4px;
    }

    .archetype-group {
        margin-bottom: 16px;
    }

    .archetype-group__title {
        font-size: 1em;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-muted);
    }

    .archetype-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .archetype-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--background-secondary);
    }

    .archetype-item__name {
        flex: 1;
        text-decoration: none;
        color: var(--text-normal);
    }

    .archetype-item__name:hover {
        color: var(--text-accent);
    }

    .archetype-item__eng {
        color: var(--text-muted);
        font-size: 0.9em;
    }

    .archetype-item__source {
        font-size: 0.85em;
        color: var(--text-muted);
        padding: 2px 6px;
        background-color: var(--background-primary);
        border-radius: 3px;
    }
</style>
