<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { copyArmorToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import type { FullArmor } from 'src/domain/models/armor/FullArmor';
	import HeaderFullUi from '../uikit/HeaderFullUi.svelte';

    interface Props {
        currentItem: FullArmor,
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
        onClick={() => copyArmorToClipboard(currentItem)}
    />
    <div class="table">
        <div class="table-item">
            <em class="table-title">Класс брони (AC)</em>
            {currentItem.armorClass}
        </div>
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
        <div class="table-item">
            <em class="table-title">Помеха на Скрытность</em>
            {currentItem.disadvantage ? 'Есть' : 'Нет'}
        </div>
        <div class="table-item">
            <em class="table-title">Требование к Силе</em>
            {currentItem.requirement ? 'Есть' : 'Нет'}
        </div>
        <div class="table-item">
            <em class="table-title">Надевание / Снятие</em>
            {currentItem.duration}
        </div>
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