<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullBackground } from 'src/domain/models/background/FullBackground';
	import { copyBackgroundToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';

    interface Props {
        currentItem: FullBackground,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

    const onBackgroundCopy = () => {
        copyBackgroundToClipboard(currentItem);
    };
</script>

<div class="background-details">
    <div class="background-details__header">
        <h2 class="background-details__title">{currentItem.name.rus}</h2>
        <p class="background-details__subtitle">{currentItem.name.eng}</p>
        
        <div class="background-details__actions">
            <button 
                class="background-details__copy" 
                onclick={onBackgroundCopy}
                title="Копировать в буфер обмена"
            >
                📋
            </button>
        </div>
    </div>

    <div class="background-details__content">
        <div class="background-details__section">
            <h3>Навыки</h3>
            <div class="background-details__skills">
                {#each currentItem.skills as skill}
                    <span class="skill-tag">{skill}</span>
                {/each}
            </div>
        </div>

        {#if currentItem.toolOwnership}
            <div class="background-details__section">
                <h3>Владение инструментами</h3>
                <HtmlBlock content={currentItem.toolOwnership} />
            </div>
        {/if}

        <div class="background-details__section">
            <h3>Снаряжение</h3>
            <ul class="background-details__equipment">
                {#each currentItem.equipments as equipment}
                    <li><HtmlBlock content={equipment} /></li>
                {/each}
            </ul>
        </div>

        <div class="background-details__section">
            <h3>Стартовые деньги</h3>
            <p>{currentItem.startGold} зм</p>
        </div>

        <div class="background-details__section">
            <h3>Описание</h3>
            <HtmlBlock content={currentItem.description} />
        </div>

        {#if currentItem.personalization}
            <div class="background-details__section">
                <h3>Персонализация</h3>
                <HtmlBlock content={currentItem.personalization} />
            </div>
        {/if}

        <div class="background-details__source">
            <small>
                Источник: {currentItem.source.name} ({currentItem.source.shortName})
            </small>
        </div>
    </div>
</div>

<style>
    .background-details {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .background-details__header {
        border-bottom: 2px solid var(--interactive-accent);
        padding-bottom: 1rem;
        margin-bottom: 1rem;
        position: relative;
    }

    .background-details__title {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        color: var(--text-accent);
    }

    .background-details__subtitle {
        margin: 0;
        font-style: italic;
        color: var(--text-muted);
    }

    .background-details__actions {
        position: absolute;
        top: 0;
        right: 0;
    }

    .background-details__copy {
        background: none;
        border: 1px solid var(--background-modifier-border);
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
    }

    .background-details__copy:hover {
        background: var(--background-modifier-hover);
    }

    .background-details__section {
        margin-bottom: 1.5rem;
    }

    .background-details__section h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-accent);
        border-bottom: 1px solid var(--background-modifier-border);
        padding-bottom: 0.25rem;
    }

    .background-details__skills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .skill-tag {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }

    .background-details__equipment {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .background-details__equipment li {
        margin-bottom: 0.5rem;
        padding-left: 1rem;
        position: relative;
    }

    .background-details__equipment li::before {
        content: "•";
        position: absolute;
        left: 0;
        color: var(--interactive-accent);
    }

    .background-details__source {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--background-modifier-border);
        text-align: center;
        color: var(--text-muted);
    }
</style>