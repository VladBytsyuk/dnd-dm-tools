<script lang="ts">
    import type { FullClass } from '../../../domain/models/class/FullClass';
    import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
    import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
    import HtmlBlock from '../uikit/HtmlBlock.svelte';
    import { copyClassToClipboard } from '../../../data/clipboard';
    import { onMount, onDestroy } from 'svelte';
    import { DiceRollersManager } from '../dice-roller/DiceRollersManager';

    let {
        currentItem,
        uiEventListener,
    } = $props<{
        currentItem: FullClass;
        uiEventListener: IUiEventListener;
    }>();

    // Dice rollers manager
    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

    function handleBackToParent(e: MouseEvent) {
        if (currentItem.parentClassUrl) {
            e.preventDefault();
            uiEventListener.onClassClick(currentItem.parentClassUrl);
        }
    }
</script>

<div class="full-item">
    <UiDetailHeader
        name={currentItem.name}
        source={currentItem.source}
        onCopy={() => copyClassToClipboard(currentItem)}
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
        padding: var(--dnd-ui-space-12);
        border-bottom: 1px solid var(--dnd-ui-border-subtle);
        background-color: var(--dnd-ui-surface-raised);
    }

    .back-link {
        color: var(--dnd-ui-accent-primary);
        text-decoration: none;
        font-weight: var(--dnd-ui-font-weight-medium);
        display: inline-flex;
        align-items: center;
        gap: var(--dnd-ui-space-4);
    }

    .back-link:hover {
        text-decoration: underline;
    }

    /* HTML content */
    .class-html-content {
        margin-top: var(--dnd-ui-space-16);
    }

    .class-loading {
        margin-top: var(--dnd-ui-space-16);
        padding: var(--dnd-ui-space-20);
        text-align: center;
        color: var(--dnd-ui-text-muted);
        font-style: italic;
    }
</style>
