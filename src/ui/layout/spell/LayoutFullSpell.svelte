<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import { mapDiceRollerTags } from "src/domain/mappers";
    import { TEXTS } from "src/res/texts_ru";
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';

    let { spell, onRoll } = $props();

    const diceRollersManager = new DiceRollersManager(onRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

</script>

<div class="layout-spell-card">
    <div class="layout-spell-card-front">
        <div class="layout-spell-card-body">
            <h3 class="layout-spell-card-name layout-spell-card-lined">{spell.name.rus}</h3>
            <ul class="layout-spell-card-status layout-spell-card-lined">
                <li class="layout-spell-card-block layout-spell-card-lined">
                    <em class="layout-spell-card-block-title">{TEXTS.spellCastingTime}</em>
                    {spell.time}
                </li>
                <li class="layout-spell-card-block layout-spell-card-block-right layout-spell-card-lined">
                    <em class="layout-spell-card-block-title">{TEXTS.spellRange}</em>
                    {spell.range}
                </li>
            </ul> 

            <ul class="layout-spell-card-status layout-spell-card-lined">
                <li class="layout-spell-card-block layout-spell-card-lined">
                    <em class="layout-spell-card-block-title">{TEXTS.spellComponents}</em>
                    V, S, M
                </li>
                <li class="layout-spell-card-block layout-spell-card-block-right layout-spell-card-lined">
                    <em class="layout-spell-card-block-title">{TEXTS.spellDuration}</em>
                    {spell.duration}
                </li>
            </ul>
      
            <b class="layout-spell-card-need">{spell.components.m}</b>
            
            <div class="layout-spell-card-text">{@html mapDiceRollerTags(spell.description)}</div>											
        </div>    

        <b class="layout-spell-card-class">{spell.classes[0].name}</b>
        {#if spell.level === 0}
            <b class="layout-spell-card-type">{TEXTS.spellCantrip} {spell.school}</b>
        {:else}
            <b class="layout-spell-card-type">{spell.level} {TEXTS.spellLevel} {spell.school}</b>
        {/if}
    </div>
</div>

<style>
    .layout-spell-card {
        display: inline-block;
        min-width: 2.5in;
        min-height: 3.5in;
        width: 100%;
        height: 100%;
        background: maroon !important;
        color: black;
        padding: 0;
        font-size: 10px;
        position: relative;
        margin: 0px;
        vertical-align: top;
        text-align: left;
        z-index: 1;
        margin: 0 1px 1px 0;
    }

    .layout-spell-card-front {
        height: 100%;
        width: 100%;
        padding: 10px 10px 25px;
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
    }

    .layout-spell-card-body {
        background-color: #fff !important;
        border-radius: 5px;
        height: 100%;
        overflow: hidden;
    }

    .layout-spell-card-name {
        font-size: 14px;
        line-height: normal;
        padding: 6px 5px;
        margin: 0;
        text-transform: uppercase;
        text-align: center;
    }

    .layout-spell-card-status {
        border-color: maroon !important;
        list-style: none;
        text-align: center;
        padding: 0;
        margin: 0;
    }

    .layout-spell-card-lined {
        border-bottom: 2px solid maroon;
    }

    .layout-spell-card-block {
        padding: 2px 4px;
        text-align: center;
        float: left;
        vertical-align: top;
        background-color: #fff !important;
        font-size: 9px;
        line-height: 9px;
        min-height: 25px;
        width: 50%;
        margin: 0;
        box-sizing: border-box;
    }

    .layout-spell-card-block-title {
        font-style: normal;
        text-transform: uppercase;
        display: block;
        font-weight: bold;
        padding-bottom: 2px;
        color: maroon !important;
    }

    .layout-spell-card-block-right {
        border-left: 2px solid maroon;
    }

    .layout-spell-card-need {
        background-color: maroon !important;
        box-sizing: border-box;    
        color: white !important;
        display: block;
        font-size: 8px;
        font-style: italic;
        text-align: left center;
        padding: 4px 4px 4px;
        font-weight: normal;
    }

    .layout-spell-card-text {
        padding: 2px 4px;
        font-size: 10px;
        margin: 0;
    }

    .layout-spell-card-class {
        position: absolute;
        bottom: 8px;
        color: #fff !important;
        left: 10px;
        font-size: 9px;
        font-weight: normal;
    }

    .layout-spell-card-type {
        position: absolute;
        bottom: 8px;
        color: #fff !important;
        right: 10px;
        font-size: 10px;
        font-weight: normal;
    }
</style>
