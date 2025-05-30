<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { ClipboardCopy } from 'lucide-svelte';
    import { TEXTS } from "src/res/texts_ru";
    import { copyMonsterToClipboard } from "src/data/clipboard";
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';
	import { calculateAndFormatModifier, formatModifier } from 'src/domain/modifier';
	import { DiceRollersManager } from '../../dice-roller/DiceRollersManager';
	import { addLinkListeners, handleHtml, joinList, joinSpeed, separate } from 'src/domain/utils';

    let { monster, isTwoColumns, onRoll, onSpellHover } = $props()

    const diceRollersManager = new DiceRollersManager(onRoll);
    
    onMount(() => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-5e-light' : 'theme-5e-dark');

    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            themeClass = value === Theme.Light ? 'theme-5e-light' : 'theme-5e-dark';
        });

        return () => { unsubscribe() };
    });

    const linkListener = addLinkListeners(onSpellHover);
</script>
  
<div class="layout-5e {themeClass}">
    <div class={`layout-5e-statblock ${isTwoColumns ? 'layout-5e-statblock-wide' : ''}`}>
        <!-- Header -->
        <div class="layout-5e-statblock-header">
            <div class="layout-5e-statblock-header-name">{monster.name.rus}</div>
            {#if monster.size || monster.type || monster.alignment}
            <div class="layout-5e-statblock-header-subtitle">
                {[monster.size?.rus, monster.type?.name].filter(Boolean).join(' ')}
                {monster.alignment ? `, ${monster.alignment}` : ''}
            </div>
            {/if}
        </div>

        <svg class="tapered-rule" height="5" width="100%">
            <polyline points="0,0 400,2.5 0,5" />
        </svg>

        <!-- Base Info -->
        <div class="layout-5e-statblock-base-info">
            {#if monster.armorClass}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutArmorClass}:</span> 
                <span class="layout-5e-statblock-base-info-item-value">
                    {monster.armorClass}
                    {#if monster.armors?.length}
                    ({joinList(monster.armors)})
                    {/if}
                </span>
            </div>
            {/if}

            {#if monster.hits}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutHits}:</span>
                <span class="layout-5e-statblock-base-info-item-value">
                    {monster.hits.average} (<dice-roller label={TEXTS.layoutHits} formula="{monster.hits.formula}{monster.hits.sign}{monster.hits.bonus}">{monster.hits.formula}{monster.hits.sign}{monster.hits.bonus}</dice-roller>)
                </span>
            </div>
            {/if}

            {#if monster.speed}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutSpeed}:</span> 
                {#if monster.speed?.length}
                <span class="layout-5e-statblock-base-info-item-value">{joinSpeed(monster.speed)}</span>
                {/if}
            </div>
            {/if}
        </div>

        <svg class="tapered-rule" height="5" width="100%">
            <polyline points="0,0 400,2.5 0,5" />
        </svg>

        <!-- Scores Table -->
        {#if monster.ability}
            <div class="layout-5e-statblock-scores-table">
            {#each Object.entries({
                [TEXTS.layoutStr]: monster.ability.str,
                [TEXTS.layoutDex]: monster.ability.dex,
                [TEXTS.layoutCon]: monster.ability.con,
                [TEXTS.layoutInt]: monster.ability.int,
                [TEXTS.layoutWis]: monster.ability.wiz,
                [TEXTS.layoutCha]: monster.ability.cha
            }) as entry}
                <div class="layout-5e-statblock-scores-table-item">
                <div class="layout-5e-statblock-scores-table-item-title"><b>{entry[0]}</b></div>
                <dice-roller label={entry[0]} formula={"к20+" + calculateAndFormatModifier(entry[1])}>
                    {entry[1]} ({calculateAndFormatModifier(entry[1])})
                </dice-roller>
                </div>
            {/each}
            </div>
        {/if}

        <svg class="tapered-rule" height="5" width="100%">
            <polyline points="0,0 400,2.5 0,5" />
        </svg>

        <div class="layout-5e-statblock-base-info">
            {#if monster.savingThrows}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutSaves}</span> 
                <span class="layout-5e-statblock-base-info-item-value" use:linkListener>
                    {@html separate(monster.savingThrows.map(it => 
                        `${it.name} <dice-roller label="${TEXTS.layoutSave}. ${it.name}" formula="к20${formatModifier(it.value)}">${formatModifier(it.value)}</dice-roller>`
                    ))}
                </span>
            </div>
            {/if}

            {#if monster.skills}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutSkills}</span> 
                <span class="layout-5e-statblock-base-info-item-value" use:linkListener>
                    {@html separate(monster.skills.map(it => 
                        `${it.name} <dice-roller label="${TEXTS.layoutSkill}. ${it.name}" formula="к20${formatModifier(it.value)}">${formatModifier(it.value)}</dice-roller>`
                    ))}
                </span>
            </div>
            {/if}

            {#if monster.damageVulnerabilities}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutDamageVulnerabilities}</span> 
                <span class="layout-5e-statblock-base-info-item-value">{separate(monster.damageVulnerabilities)}</span>
            </div>
            {/if}

            {#if monster.damageResistances}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutDamageResistances}</span> 
                <span class="layout-5e-statblock-base-info-item-value">{separate(monster.damageResistances)}</span>
            </div>
            {/if}

            {#if monster.damageImmunities}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutDamageImmunities}</span> 
                <span class="layout-5e-statblock-base-info-item-value">{separate(monster.damageImmunities)}</span>
            </div>
            {/if}

            {#if monster.conditionImmunities}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutConditionImmunities}</span> 
                <span class="layout-5e-statblock-base-info-item-value">{separate(monster.conditionImmunities)}</span>
            </div>
            {/if}

            {#if monster.senses}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutSenses}</span> 
                <span class="layout-5e-statblock-base-info-item-value">
                    {monster.senses.senses ? separate(monster.senses.senses.map(it => `${it.name} ${it.value} ${TEXTS.layoutFt}.,`)) : ''}
                    {TEXTS.layoutPassivePerception} {monster.senses.passivePerception}
                </span>
            </div>
            {/if}

            {#if monster.languages}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutLanguages}</span> 
                <span class="layout-5e-statblock-base-info-item-value">{separate(monster.languages)}</span>
            </div>
            {/if}

            {#if monster.challengeRating}
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-title">{TEXTS.layoutChallengeRating}</span> 
                <span class="layout-5e-statblock-base-info-item-value">
                    {monster.challengeRating + (monster.experience ? ` (${monster.experience} XP)` : '')}
                </span>
            </div>
            {/if}
        </div>

        <svg class="tapered-rule" height="5" width="100%">
            <polyline points="0,0 400,2.5 0,5" />
        </svg>

        <!-- Abilities Block -->
        {#if monster.feats}
            <div class="layout-5e-statblock-property-block">
            {#each monster.feats as feat}
                <div use:linkListener><b>{feat.name}.</b> {@html handleHtml(feat.value)}</div>
            {/each}
            </div>
        {/if}

        <!-- Action Blocks -->
        {#each [
            { action: monster.actions, title: TEXTS.layoutActions},
            { action: monster.bonusActions, l: TEXTS.layoutBonusActions},
            { action: monster.reactions, l: TEXTS.layoutReactions}
        ] as item}
            {#if item.action != undefined} 
                {#if item.action.length}
                <div class="layout-5e-statblock-property-block">
                    <div class="layout-5e-statblock-block-header">{item.title}</div>
                    {#each item.action as action}
                    <div use:linkListener><b>{action.name}.</b> {@html handleHtml(action.value)}</div>
                    {/each}
                </div>
                {/if}
            {/if}
        {/each}
    </div>

    <!-- Lair Blocks -->
    {#each [
        { action: monster.lair?.description, title: TEXTS.layoutLair},
        { action: monster.lair?.action, title: TEXTS.layoutLairActions},
        { action: monster.lair?.effect, title: TEXTS.layoutRegionalEffects},
    ] as item}
        {#if item.action != undefined} 
        <div class="layout-5e-statblock-property-block">
            <div class="layout-5e-statblock-block-header">{item.title}</div>
            <div class="layout-5e-statblock-base-info-item">
                <span class="layout-5e-statblock-base-info-item-value" use:linkListener>{@html handleHtml(item.action)}</span>
            </div>
        </div>
        {/if}
    {/each}

    <!-- Copy Button -->
    <button class="layout-5e-copy-button" onclick={() => copyMonsterToClipboard(monster)}><ClipboardCopy/></button> 

</div>

<style>
    :global(.theme-5e-light) {
        --primary-color: #922610;
        --tapered-rule-color: #922610;
        --secondary-color: #7A200D;
        --border-color: #7A200D;
        --button-color: #922610af;
    }

    :global(.theme-5e-dark) {
        --primary-color: #ff6b4ac8;
        --tapered-rule-color: #ff6b4aa9;
        --secondary-color: #ff6b4aa9;
        --border-color: #ff6b4aa9;
        --button-color: #ffffffaf;
    }

    .layout-5e {
        display: inline-block;
        position: relative;
        background: var(--bg-color);
        border-radius: 8px;;
        color: var(--text-color);
    }

    .layout-5e-copy-button {
        background: #00000000;
        display: inline-block;
        position: absolute;
        top: 1em;
        right: 3em;
        z-index: 1;
        color: var(--button-color);
    }

    .layout-5e-statblock {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: inline-block;
        vertical-align: top;
        width: 100%;
        background: var(--bg-color);
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
    }

    .layout-5e-statblock-wide {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        column-count: 2;
        column-gap: 1em;
        gap: 1em;
        vertical-align: top;
        width: 100%;
        background: var(--bg-color);
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif;
    }

    .layout-5e-statblock-section {
        flex: 1;
    }

    .layout-5e-statblock-header {
        margin: 0 0 0.5em;
    }

    .layout-5e-statblock-header-name {
        font-family: 'Libre Baskerville', 'Lora', 'Calisto MT', 'Bookman Old Style', Bookman, 'Goudy Old Style', Garamond, 'Hoefler Text', 'Bitstream Charter', Georgia, serif;
        color: var(--primary-color);
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
        font-variant: small-caps;
        font-weight: bold;
    }

    .layout-5e-statblock-header-subtitle {
        font-family: 'Noto Sans', 'Myriad Pro', Calibri, Helvetica, Arial, sans-serif; 
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        line-height: 1.2em;
    }

    .layout-5e-statblock-base-info {
        margin: 0.5em 0 0.5em
    }

    .layout-5e-statblock-base-info-item {
        color: var(--primary-color);
        font-size: 12.5px;
        line-height: 1.2em;
    }

    .layout-5e-statblock-base-info-item-title {
        font-weight: bold;
    }

    .layout-5e-statblock-base-info-item-value {
        color: var(--text-color);
    }

    .layout-5e-statblock-scores-table {
        text-align: center;
        color: var(--primary-color);
        margin: 1em 0 1em;
    }

    .layout-5e-statblock-scores-table-item {
        display: inline-block;
        vertical-align: middle;
        width: 15.5%;
        min-width: 40px;
        font-size: 12px;
        line-height: 1em;
    }

    .layout-5e-statblock-scores-table-item-title {
        margin: 0 0 0.5em;
    }

    .layout-5e-statblock-property-block {
        padding: 0.5em 0 0;
        color: var(--text-color);
    }

    .layout-5e-statblock-block-header {
        border-bottom: 2px solid;
        border-bottom-color: var(--border-color);
        color: var(--secondary-color);
        font-size: 18px;
        font-variant: small-caps;
        font-weight: normal;
        letter-spacing: 1px;
        margin: 0.5em 0 0.125em;
        padding: 0 0 6px;
        text-indent: 5px;
    }

    .layout-5e-statblock-generic-description {
        margin: 0.5em 0 0.125em;
    }

    .tapered-rule {
        display: block;
        width: 100%;
        height: 5px;
        border: none;
        color: var(--tapered-rule-color);
        fill: var(--tapered-rule-color);
    }
</style>
