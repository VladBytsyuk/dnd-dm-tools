<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import { mapDiceRollerTags } from "src/domain/mappers";
    import { TEXTS } from "src/res/texts_ru";
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';

    let { spell, onRoll } = $props();

    const diceRollersManager = new DiceRollersManager(onRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });


    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-5e-light' : 'theme-5e-dark');
    
    let classThemeName: string;
    switch (spell.classes[0].url) {
        case "/classes/bard":
            classThemeName = "bard";
            break;
        case "/classes/wizard":
            classThemeName = "wizard";
            break;
        case "/classes/druid":
            classThemeName = "druid";
            break;
        case "/classes/cleric":
            classThemeName = "cleric";
            break;
        case "/classes/artificer":
            classThemeName = "artificer";
            break;
        case "/classes/warlock":
            classThemeName = "warlock";
            break;
        case "/classes/paladin":
            classThemeName = "paladin";
            break;
        case "/classes/ranger":
            classThemeName = "ranger";
            break;
        case "/classes/sorcerer":
            classThemeName = "sorcerer";
            break;
        default:
            classThemeName = "default"
    }
    
    let classTheme = $state(classThemeName);

    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            themeClass = value === Theme.Light ? 'theme-light' : 'theme-dark';
        });

        return () => { unsubscribe() };
    });
</script>

<div class="layout-spell-card {themeClass} {classTheme}">
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
                    {#if spell.components.v}В{/if}
                    {#if spell.components.s}С{/if}
                    {#if spell.components.m}М{/if}
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
    :global(.bard) {
        --class-color: #D9730FFF;
    }
    :global(.wizard) {
        --class-color: #800000FF;
    }
    :global(.druid) {
        --class-color: #377C15FF;
    }
    :global(.cleric) {
        --class-color: #7B93ADFF;
    }
    :global(.artificer) {
        --class-color: #F83A22FF;
    }
    :global(.warlock) {
        --class-color: #482869FF;
    }
    :global(.paladin) {
        --class-color: #3AAFB1FF;
    }
    :global(.ranger) {
        --class-color: #7C5049FF;
    }
    :global(.sorcerer) {
        --class-color: #3464B3FF;
    }
    :global(.default) {
        --class-color: #888888FF;
    }


    :global(.theme-light) {
        --bg-color: #FDF1DC;
        --text-color: #000000;
        --text-inverted-color: #ffffff;
    }

    :global(.theme-dark) {
        --bg-color: #202020;
        --text-color: #ffffff;
        --text-inverted-color: #ffffff;
    }

    .layout-spell-card {
        display: inline-block;
        min-width: 170px;
        background: var(--class-color) !important;
        color: var(--text-color);
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
    }

    .layout-spell-card-body {
        background-color: var(--bg-color) !important;
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
        border-color: var(--class-color) !important;
        list-style: none;
        text-align: center;
        padding: 0;
        margin: 0;
    }

    .layout-spell-card-lined {
        border-bottom: 2px solid var(--class-color);
    }

    .layout-spell-card-block {
        padding: 2px 4px;
        text-align: center;
        float: left;
        vertical-align: top;
        background-color: var(--bg-color) !important;
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
        color: var(--class-color) !important;
    }

    .layout-spell-card-block-right {
        border-left: 2px solid var(--class-color);
    }

    .layout-spell-card-need {
        background-color: var(--class-color) !important;
        box-sizing: border-box;    
        color: var(--text-inverted-color) !important;
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
        color: var(--text-inverted-color) !important;
        left: 10px;
        font-size: 9px;
        font-weight: normal;
    }

    .layout-spell-card-type {
        position: absolute;
        bottom: 8px;
        color: var(--text-inverted-color) !important;
        right: 10px;
        font-size: 10px;
        font-weight: normal;
    }
</style>
