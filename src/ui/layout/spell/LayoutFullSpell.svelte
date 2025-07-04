<script lang="ts">
	import { separate } from 'src/domain/utils';
    import { onDestroy, onMount } from 'svelte';
    import { TEXTS } from "src/res/texts_ru";
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';
    import type { SpellClass, SpellSubclass } from 'src/domain/spell';
	import { copySpellToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';

    let { spell, uiEventListener } = $props();

    const diceRollersManager = new DiceRollersManager(uiEventListener.onRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });


    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-light' : 'theme-dark');
    
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

    let subClasses = !spell.subclasses ? undefined : separate(spell.subclasses.map((it: SpellSubclass) => it.name + " (" + it.class + ")"));
    let classes = separate(spell.classes.map((it: SpellClass) => it.name));
    let classHint = TEXTS.spellClasses + ": " + classes + (subClasses ? "\n" + TEXTS.spellSubclasses + ": " + subClasses : "");
</script>

<div class="layout-spell-card {themeClass} {classTheme}">
    <div class="layout-spell-card-front">
        <div class="layout-spell-card-body">
            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
            <h3 
                class="layout-spell-card-name layout-spell-card-lined"
                role="button"
                tabindex="0"
                onclick={() => copySpellToClipboard(spell)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copySpellToClipboard(spell); } }}
                aria-label="{TEXTS.copyToClipboard}"
            >{spell.name.rus}{spell.ritual ? " [" + TEXTS.spellRitual + "]" : ""} 📋</h3>
            
            <div class="layout-spell-card-table">

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">{TEXTS.spellCastingTime}</em>
                    {spell.time}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">{TEXTS.spellRange}</em>
                    {spell.range}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">{TEXTS.spellComponents}</em>
                    {#if spell.components.v}{TEXTS.spellVerbal}{/if}
                    {#if spell.components.s}{TEXTS.spellSomatic}{/if}
                    {#if spell.components.m}{TEXTS.spellMaterial}{/if}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">{TEXTS.spellDuration}</em>
                    {spell.duration}
                </div>

            </div>

            <b class="layout-spell-card-need" style="{spell.components && spell.components.m ? "" : "height:2px;padding:0px;"}">{spell.components.m}</b>
            
            <div class="layout-spell-card-text">
                <HtmlBlock htmlContent={spell.description} htmlLinkListener={uiEventListener} />
            </div>	
            {#if spell.upper}<div class="layout-spell-card-text layout-spell-card-upper-lined"><HtmlBlock htmlContent={spell.upper} htmlLinkListener={uiEventListener} /></div>{/if}											
        </div>    

        <div class="layout-spell-card-class" title="{classHint}">{spell.classes[0].name}</div>
        {#if spell.source && spell.source.shortName}<div class="layout-spell-card-source">{spell.source.shortName}</div>{/if}
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

    .layout-spell-card {
        display: inline-block;
        min-width: 170px;
        background: var(--class-color) !important;
        border-radius: 8px;
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
        background-color: var(--color-base-00) !important;
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

    .layout-spell-card-lined {
        border-bottom: 2px solid var(--class-color);
    }

    .layout-spell-card-upper-lined {
        border-top: 2px solid var(--class-color);
    }

    .layout-spell-card-table {
        background-color: var(--class-color) !important;
        list-style: none;
        text-align: center;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: stretch;
        align-content: flex-start;
        padding: 0;
        margin: -1px;
    }

    .layout-spell-card-table-item {
        background-color: var(--color-base-00) !important;
        margin: 1px;
        padding: 4px 6px;
        line-height: 9px;
        min-height: 25px;
        order: 0;
        flex: 1 1 auto;
        align-self: center;
    }

    .layout-spell-card-block-title {
        font-style: normal;
        text-transform: uppercase;
        display: block;
        font-weight: bold;
        padding-bottom: 2px;
        color: var(--class-color) !important;
    }

    .layout-spell-card-need {
        background-color: var(--class-color) !important;
        box-sizing: border-box;    
        color: var(--text-inverted-color) !important;
        display: block;
        font-size: 8px;
        font-style: italic;
        text-align: left center;
        padding: 4px 0px 4px;
        font-weight: normal;
    }

    .layout-spell-card-text {
        padding: 2px 4px;
        font-size: 10px;
        margin: 0;
    }

    .layout-spell-card-class {
        position: absolute;
        bottom: 6px;
        color: var(--text-inverted-color) !important;
        left: 10px;
        font-size: 9px;
        font-weight: normal;
    }

    .layout-spell-card-source {
        position: absolute;
        bottom: 6px;
        left: 50%;
        right: 50%;
        color: var(--text-inverted-color) !important;
        font-size: 9px;
        font-weight: normal;
    }

    .layout-spell-card-type {
        position: absolute;
        bottom: 6px;
        color: var(--text-inverted-color) !important;
        right: 10px;
        font-size: 10px;
        font-weight: normal;
    }
</style>
