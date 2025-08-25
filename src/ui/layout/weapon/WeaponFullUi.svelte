<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { copyWeaponToClipboard } from 'src/data/clipboard';
	import { joinProperties } from 'src/domain/utils/utils';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import HeaderFullUi from '../uikit/HeaderFullUi.svelte';

    interface Props {
        currentItem: FullWeapon,
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
    <HeaderFullUi
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onClick={() => copyWeaponToClipboard(currentItem)}
    />
    <div class="table">
        {#if currentItem.price}
            <div class="table-item">
                <em class="table-title">Стоимость</em>
                {currentItem.price}
            </div>
        {/if}
        {#if currentItem.damage}
            <div class="table-item">
                <em class="table-title">Урон</em>
                {#if currentItem.damage.dice}
                    <dice-roller label="Урон ({currentItem.damage.type})" formula={currentItem.damage.dice}></dice-roller>
                {/if}
                {currentItem.damage.type}
            </div>
        {/if}
        {#if currentItem.weight}
            <div class="table-item">
                <em class="table-title">Вес</em>
                {currentItem.weight} фун.
            </div>
        {/if}
        {#if currentItem.properties}
            <div class="table-item">
                <em class="table-title">Свойства</em>
                <HtmlBlock htmlContent={joinProperties(currentItem.properties)} uiEventListener={uiEventListener} />
            </div>
        {/if}
    </div>
    {#if currentItem.description}
        <div class="text">
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </div>
    {/if}
    {#if currentItem.special}
        <span class="special">Особое свойство:</span>
        <div class="text">
            <HtmlBlock htmlContent={currentItem.special} uiEventListener={uiEventListener} />
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

    .special {
        font-weight: 600;
        font-size: 14px;
    }
</style>