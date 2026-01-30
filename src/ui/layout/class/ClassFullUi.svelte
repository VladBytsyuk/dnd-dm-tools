<script lang="ts">
    import type { FullClass } from '../../../domain/models/class/FullClass';
    import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
    import HeaderFullUi from '../uikit/HeaderFullUi.svelte';
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
