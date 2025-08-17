<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullItem } from 'src/domain/models/items/FullItem';
	import { copyEquipmentToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import { separate } from 'src/domain/utils/utils';

    interface Props {
        currentItem: FullItem,
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
</script>

<div class="body">
    <div class="header">
        <div class="name-container">
            <div
                class="name"
                role="button"
                tabindex="0"
                onclick={() => copyEquipmentToClipboard(currentItem)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyEquipmentToClipboard(currentItem); } }}
                aria-label="Скопировать в буфер обмена"
            >
                {currentItem.name.rus} 📋
            </div>
            <div class="subname">{currentItem.name.eng}</div>
        </div>
        <div class="info-container">
            {#if currentItem.categories}<div class="type">{separate(currentItem.categories)}</div>{/if}
            {#if currentItem.source}<div class="source">Источник: {currentItem.source.shortName}</div>{/if}
        </div>
    </div>
    <div class="table">
        {#if currentItem.price}
            <div class="table-item">
                <em class="table-title">Стоимость</em>
                {currentItem.price}
            </div>
        {/if}
        {#if currentItem.weight}
            <div class="table-item">
                <em class="table-title">Вес</em>
                {currentItem.weight} фун.
            </div>
        {/if}
    </div>
    {#if currentItem.description}
        <div class="text">
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </div>
    {/if}
</div>

<style>
    .body {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: inline-block;
        vertical-align: top;
        width: 100%;
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: "Open Sans", sans-serif;
        background: var(--bg-color);
        color: var(--text-color);
        background: #00000020;
        border-radius: 8px;
        border-color: #00000090;
        border-width: 2px;
    }

    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;
    }

    .name {
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .subname {
        opacity: 0.75;
        font-size: 12px;
        margin: 0 0 2px;
    }

    .info-container {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        padding: 12px;
        background: #ffffff14;
        border-radius: 8px;
    }

    .type {
        flex: 1 1 100%;
        margin-right: 8px;
        font-style: italic;
    }

    .source {
        flex-shrink: 0;
    }
    
    .table {
        list-style: none;
        text-align: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: stretch;
        align-content: flex-start;
        padding: 0;
        margin-bottom: 1em;
        background: #ffffff14;
        border-radius: 8px;
    }

    .table-item {
        margin: 1px;
        padding: 4px 6px;
        order: 0;
        flex: 1 1 auto;
        align-self: center;
    }

    .table-title {
        display: block;
        text-transform: uppercase;
        font-weight: bold;
        font-style: normal;
        padding-bottom: 4px;
    }

    .text {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>