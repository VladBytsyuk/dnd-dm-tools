<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullArtifact } from 'src/domain/models/artifact/FullArtifact';
	import { copyArtifactToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import HeaderFullUi from '../uikit/HeaderFullUi.svelte';

    interface Props {
        currentItem: FullArtifact,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

    onMount(async () => diceRollersManager.onMount());
    onDestroy(() => diceRollersManager.onDestroy());
</script>

<div class="body">
    <HeaderFullUi
        images={currentItem.images}
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onClick={() => copyArtifactToClipboard(currentItem)}
        uiEventListener={uiEventListener}
    />
    <div class="table">
        <div class="table-item">
            <em class="table-title">Настройка</em>
            {currentItem.customization ? 'Требуется' : 'Не требуется'}
        </div>
        {#if currentItem.cost?.dmg}
            <div class="table-item">
                <em class="table-title">Стоимость DMG</em>
                {currentItem.cost.dmg}
            </div>
        {/if}
        {#if currentItem.cost?.xge}
            <div class="table-item">
                <em class="table-title">Стоимость XGE</em>
                {currentItem.cost.xge}
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