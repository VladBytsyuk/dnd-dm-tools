<script lang="ts">
	import { separate } from 'src/domain/utils/utils';
    import { onDestroy, onMount } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';
	import { copySpellToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import type { Class } from 'src/domain/models/common/Class';

    let { currentItem, uiEventListener } = $props();

    let diceRollersManager: DiceRollersManager | undefined;

    onMount(async () => {
        diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager?.onDestroy();
    });


    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-light' : 'theme-dark');
    
    const classThemeName = $derived.by(() => {
        if (!currentItem) {
            return "default";
        }

        switch (currentItem.classes[0].url) {
            case "/classes/bard":
                return "bard";
            case "/classes/wizard":
                return "wizard";
            case "/classes/druid":
                return "druid";
            case "/classes/cleric":
                return "cleric";
            case "/classes/artificer":
                return "artificer";
            case "/classes/warlock":
                return "warlock";
            case "/classes/paladin":
                return "paladin";
            case "/classes/ranger":
                return "ranger";
            case "/classes/sorcerer":
                return "sorcerer";
            default:
                return "default";
        }
    });
    
    let classTheme = $derived(classThemeName);

    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            themeClass = value === Theme.Light ? 'theme-light' : 'theme-dark';
        });

        return () => { unsubscribe() };
    });

    let subClasses = $derived((!currentItem || !currentItem.subclasses) ? undefined : separate(currentItem.subclasses.map((it: Class) => it.name + " (" + it.class + ")")));
    let classes = $derived(currentItem ? separate(currentItem.classes.map((it: Class) => it.name)) : "");
    let classHint = $derived("Классы: " + classes + (subClasses ? "\nПодклассы: " + subClasses : ""));
</script>

{#if currentItem}
<div class="layout-spell-card {themeClass} {classTheme}">
    <div class="layout-spell-card-front">
        <div class="layout-spell-card-body">
            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
            <h3 
                class="layout-spell-card-name layout-spell-card-lined"
                role="button"
                tabindex="0"
                onclick={() => copySpellToClipboard(currentItem)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copySpellToClipboard(currentItem); } }}
                aria-label="Скопировать в буфер обмена"
            >{currentItem.name.rus}{currentItem.ritual ? " [Ритуал]" : ""} 📋</h3>
            
            <div class="layout-spell-card-table">

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">Время</em>
                    {currentItem.time}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">Дистанция</em>
                    {currentItem.range}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">Компоненты</em>
                    {#if currentItem.components.v}В{/if}
                    {#if currentItem.components.s}С{/if}
                    {#if currentItem.components.m}М{/if}
                </div>

                <div class="layout-spell-card-table-item">
                    <em class="layout-spell-card-block-title">Длительность</em>
                    {currentItem.duration}
                </div>

            </div>

            <b class="layout-spell-card-need" style="{currentItem.components && currentItem.components.m ? "" : "height:2px;padding:0px;"}">{currentItem.components.m}</b>
            
            <div class="layout-spell-card-text">
                <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
            </div>	
            {#if currentItem.upper}<div class="layout-spell-card-text layout-spell-card-upper-lined"><HtmlBlock htmlContent={currentItem.upper} uiEventListener={uiEventListener} /></div>{/if}											
        </div>    

        <div class="layout-spell-card-class" title="{classHint}">{currentItem.classes[0].name}</div>
        {#if currentItem.source && currentItem.source.shortName}<div class="layout-spell-card-source">{currentItem.source.shortName}</div>{/if}
        {#if currentItem.level === 0}
            <b class="layout-spell-card-type">заговор {currentItem.school}</b>
        {:else}
            <b class="layout-spell-card-type">{currentItem.level} круг {currentItem.school}</b>
        {/if}
    </div>
</div>
{/if}

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
