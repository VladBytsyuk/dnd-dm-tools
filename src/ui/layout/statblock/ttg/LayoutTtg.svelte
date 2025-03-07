<script lang="ts">
    import { ClipboardCopy } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { TEXTS } from "src/res/texts_ru";
    import { copyMonsterToClipboard } from "src/data/clipboard";
	import type { Speed } from "src/domain/monster";
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';

    let { monster, isTwoColumns } = $props()

    const formatModifier = (value: number) => {
        const mod = Math.floor((value - 10) / 2);
        return modifier(mod);
    };

    const modifier = (value: number) => {
        return value >= 0 ? `+${value}` : value.toString();
    };

    const separate = (text: Array<string>) => 
        text.join(', ');

    const joinList = (items: Array<{ name: string }>) => 
        items?.map(it => it.name).join(', ') || '';

    const joinSpeed = (items: Array<Speed>) =>
        items?.map(it => {
            let result = '';
            if (it.name) result += it.name + ' ';
            if (it.value) result += it.value + ` ${TEXTS.layoutFt}. `;
            if (it.additional) result += '(' + it.additional + ')';
            return result;
        }).join(', ') || '';

    let currentImageIndex = $state(0);
    let imagesLength = $state(0);

    onMount(() => {
        imagesLength = monster.images?.length || 0;
    });

    const nextImage = () => {
        currentImageIndex = (currentImageIndex + 1) % imagesLength;
    };

    const prevImage = () => {
        currentImageIndex = (currentImageIndex - 1 + imagesLength) % imagesLength;
    };

    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-ttg-light' : 'theme-ttg-dark');

    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            themeClass = value === Theme.Light ? 'theme-ttg-light' : 'theme-ttg-dark';
        });

        return () => { unsubscribe() };
    });
</script>
  
<div class="layout-ttg {themeClass}">
    <div class={`layout-ttg-statblock ${isTwoColumns ? 'layout-ttg-statblock-wide' : ''}`}>

        <div class="layout-ttg-statblock-section-horizontal">

            <div class="layout-ttg-statblock-section-horizontal-header">
                <!-- Header -->
                <div class="layout-ttg-statblock-header">
                    <div class="layout-ttg-statblock-header-name">{monster.name.rus}</div>
                    <div class="layout-ttg-statblock-header-subname">{monster.name.eng}</div>
                    <div class="layout-ttg-statblock-header-block">
                        {#if monster.size || monster.type || monster.alignment}
                        <div class="layout-ttg-statblock-header-subtitle">
                            {[monster.size?.rus, monster.type?.name].filter(Boolean).join(' ')}
                            {monster.alignment ? `, ${monster.alignment}` : ''}
                            {monster.size?.eng || monster.size?.cell ? '/ ' : ''}
                            {monster.size?.eng ? monster.size.eng: ' '}
                            {monster.size?.cell ? monster.size.cell: ''}
                        </div>
                        {/if}
                        {#if monster.source}
                        <div class="layout-ttg-statblock-header-source">
                            {TEXTS.layoutSource}: {monster.source.name} ({monster.source.shortName})
                        </div>
                        {/if}
                    </div>
                </div>

                <!-- Base Info -->
                <div class="layout-ttg-statblock-base-info">
                    {#if monster.armorClass}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutArmorClass}</span> 
                        <span class="layout-ttg-statblock-base-info-item-value">
                            {monster.armorClass}
                            {#if monster.armors?.length}
                            ({joinList(monster.armors)})
                            {/if}
                        </span>
                    </div>
                    {/if}

                    {#if monster.hits}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutHits}</span>
                        <span class="layout-ttg-statblock-base-info-item-value">{monster.hits.average} ({monster.hits.formula}{monster.hits.sign}{monster.hits.bonus})</span>
                    </div>
                    {/if}

                    {#if monster.speed}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSpeed}</span> 
                        {#if monster.speed?.length}
                        <span class="layout-ttg-statblock-base-info-item-value">{joinSpeed(monster.speed)}</span>
                        {/if}
                    </div>
                    {/if}

                    <!-- Similar blocks for hits, speed, etc -->
                </div>
            </div>

            <!-- Image -->
            {#if monster.images?.length && !isTwoColumns}
            <div class="layout-ttg-statblock-images">
                <div class="slider-container">
                    <img class="layout-ttg-statblock-images-item" src={monster.images[currentImageIndex]} alt={monster.name.rus}/>
                    
                    <div class="slider-controls">
                        <button class="arrow left" onclick={prevImage}>❮</button>
                        <button class="arrow right" onclick={nextImage}>❯</button>
                    </div>
                
                </div>
            </div>
            {/if}
        </div>

        <!-- Scores Table -->
        {#if monster.ability}
            <div class="layout-ttg-statblock-scores-table">
            {#each Object.entries({
                [TEXTS.layoutStr]: monster.ability.str,
                [TEXTS.layoutDex]: monster.ability.dex,
                [TEXTS.layoutCon]: monster.ability.con,
                [TEXTS.layoutInt]: monster.ability.int,
                [TEXTS.layoutWis]: monster.ability.wiz,
                [TEXTS.layoutCha]: monster.ability.cha
            }) as entry}
                <div class="layout-ttg-statblock-scores-table-item">
                <div class="layout-ttg-statblock-scores-table-item-title"><b>{entry[0]}</b></div>
                <div class="layout-ttg-statblock-scores-table-item-value">{entry[1]} ({formatModifier(entry[1])})</div>
                </div>
            {/each}
            </div>
        {/if}

        <!-- Base Info 2 -->
        <div class="layout-ttg-statblock-base-info">
            {#if monster.savingThrows}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSaves}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {separate(monster.savingThrows.map(it => `${it.name} ${modifier(it.value)}`))}
                </span>
            </div>
            {/if}

            {#if monster.skills}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSkills}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {separate(monster.skills.map(it => `${it.name} ${modifier(it.value)}`))}
                </span>
            </div>
            {/if}

            {#if monster.damageVulnerabilities}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutDamageVulnerabilities}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(monster.damageVulnerabilities)}</span>
            </div>
            {/if}

            {#if monster.damageResistances}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutDamageResistances}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(monster.damageResistances)}</span>
            </div>
            {/if}

            {#if monster.damageImmunities}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutDamageImmunities}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(monster.damageImmunities)}</span>
            </div>
            {/if}

            {#if monster.conditionImmunities}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutConditionImmunities}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(monster.conditionImmunities)}</span>
            </div>
            {/if}

            {#if monster.senses}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSenses}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {monster.senses.senses ? separate(monster.senses.senses.map(it => `${it.name} ${it.value} ${TEXTS.layoutFt}.,`)) : ''}
                    {TEXTS.layoutPassivePerception} {monster.senses.passivePerception}
                </span>
            </div>
            {/if}

            {#if monster.languages}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutLanguages}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(monster.languages)}</span>
            </div>
            {/if}

            {#if monster.challengeRating}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutChallengeRating}</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {monster.challengeRating + (monster.experience ? ` (${monster.experience} XP)` : '')}
                </span>
            </div>
            {/if}
        </div>

        <!-- Abilities Block -->
        {#if monster.feats}
            <div class="layout-ttg-statblock-property-block">
            {#each monster.feats as feat}
                <div class="layout-ttg-statblock-base-info-item">
                    <span class="layout-ttg-statblock-base-info-item-title">{feat.name}.</span>
                    <span class="layout-ttg-statblock-base-info-item-value">{@html feat.value.replace(/<\/?p>/g, '')}</span>     
                </div>
            {/each}
            </div>
        {/if}

        <!-- Action Blocks -->
        {#each [
            { action: monster.actions, title: TEXTS.layoutActions},
            { action: monster.bonusActions, title: TEXTS.layoutBonusActions},
            { action: monster.reactions, title: TEXTS.layoutReactions},
            { action: monster.legendary?.list, title: TEXTS.layoutLegendaryActions},
        ] as item}
            {#if item.action != undefined} 
                {#if item.action.length}
                <div class="layout-ttg-statblock-property-block">
                    <div class="layout-ttg-statblock-block-header">{item.title}</div>
                    {#each item.action as action}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{action.name}.</span>
                        <span class="layout-ttg-statblock-base-info-item-value">{@html action.value.replace(/<\/?p>/g, '')}</span>
                    </div>
                    {/each}
                </div>
                {/if}
            {/if}
        {/each}

        <!-- Lair Blocks -->
        {#each [
            { action: monster.lair?.description, title: TEXTS.layoutLair},
            { action: monster.lair?.action, title: TEXTS.layoutLairActions},
            { action: monster.lair?.effect, title: TEXTS.layoutRegionalEffects},
        ] as item}
            {#if item.action != undefined} 
            <div class="layout-ttg-statblock-property-block">
                <div class="layout-ttg-statblock-block-header">{item.title}</div>
                <div class="layout-ttg-statblock-base-info-item">
                    <span class="layout-ttg-statblock-base-info-item-value">{@html item.action.replace(/<\/?p>/g, '')}</span>
                </div>
            </div>
            {/if}
        {/each}
    </div>

    <button class="layout-ttg-copy-button" onclick={() => copyMonsterToClipboard(monster)}><ClipboardCopy/></button> 
</div>

<style>
    :global(.theme-ttg-light) {
        --bg-color: #f9f6eb4d;
        --text-color: #042a12;
        --secondary-text: #404040;
        --border-color: #d4d4d4;
        --accent-bg: #00000014;
        --accent-bg-sub: #00000007;
        --button-bg: rgba(0,0,0,0.1);
    }

    :global(.theme-ttg-dark) {
        --bg-color: #172026;
        --text-color: #ffffff;
        --secondary-text: #a4a4a4;
        --border-color: #3a3a3a;
        --accent-bg: #ffffff0d;
        --accent-bg-sub: #ffffff06;
        --button-bg: rgba(255,255,255,0.1);
    }

    .layout-ttg {
        display: inline-block;
        position: relative;
        background: var(--bg-color);
        color: var(--text-color);
    }

    .layout-ttg-copy-button {
        background: #00000000;
        display: inline-block;
        position: absolute;
        top: 1em;
        right: 3em;
        z-index: 1;
        color: var(--text-color);
    }

    .layout-ttg-statblock {
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
    }

    .layout-ttg-statblock-wide {
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
        font-family: "Open Sans", sans-serif;
        color: var(--text-color);
    }

    .layout-ttg-statblock-section {
        flex: 1;
    }

    .layout-ttg-statblock-header {
        margin: 0 0 0.5em;
    }

    .layout-ttg-statblock-header-name {
        font-family: "Open Sans", sans-serif;
        color: var(--text-color);
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .layout-ttg-statblock-header-subname {
        font-family: "Open Sans", sans-serif;
        color: var(--secondary-text);
        font-size: 12px;
        margin: 0 0 2px;
    }

    .layout-ttg-statblock-header-block { 
        background: var(--accent-bg);
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 6px 0px 12px;
        justify-content: space-between;
        padding: 8px;
        border-radius: 6px;
    }

    .layout-ttg-statblock-header-subtitle {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        line-height: 1.2em;
    }

    .layout-ttg-statblock-header-source {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-size: 12px;
    }

    .layout-ttg-statblock-base-info {
        margin: 0.5em 0 0.5em
    }

    .layout-ttg-statblock-base-info-item {
        color: var(--text-color);
        gap: 4px;
        margin: 4px 0px 4px;
    }

    .layout-ttg-statblock-base-info-item-title {
        color: var(--text-color);
        font-size: 12.5px;
        line-height: 1.2em;
        font-weight: bold;
    }

    .layout-ttg-statblock-base-info-item-value {
        color: var(--secondary-text);
        font-size: 12.5px;
        line-height: 1.2em;
    }

    .layout-ttg-statblock-scores-table {
        text-align: center;
        color: var(--text-color);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.25em;
        margin: 1em 0em 1em;
    }

    .layout-ttg-statblock-scores-table-item {
        display: inline-block;
        vertical-align: middle;
        font-size: 12px;
        line-height: 1em;
        flex: 1 0 calc(16% - 8px);
        min-width: calc(10% - 8px);
        max-width: calc(20% - 8px);
    }

    .layout-ttg-statblock-scores-table-item-title {
        padding: 0.5em;
        background: var(--accent-bg);
        border-radius: 6px 6px 0px 0px;
    }

    .layout-ttg-statblock-scores-table-item-value {
        padding: 0.5em;
        background: var(--accent-bg-sub);
        margin: 0px 0px 6px;;
        border-radius: 0px 0px 6px 6px;
    }

    .layout-ttg-statblock-section-horizontal {
        display: flex;
    }

    .layout-ttg-statblock-section-horizontal-header {
        flex: 1;
    }

    .layout-ttg-statblock-images {
        display: flex;
        justify-content: center; 
        align-items: center;
        width: 25%;
        z-index: 1;
        margin: 2em 0.5em 0;
    }

    .layout-ttg-statblock-images-item {
        max-height: 160px;
        width: auto;
        display: block;
        margin: 0 auto;
        border-radius: 4px;
    }

    .layout-ttg-statblock-property-block {
        padding: 0.5em 0 0;
        color: var(--text-color);
    }

    .layout-ttg-statblock-block-header {
        border-bottom: 1px solid;
        border-bottom-color: var(--border-color);
        color: var(--text-color);
        font-size: 16px;
        margin: 0.5em 0 0.5em;
        padding: 0 0 8px;
    }

    .layout-ttg-statblock-generic-description {
        margin: 0.5em 0 0.125em;
    }

    .slider-container {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .slider-controls {
        position: absolute;
        top: 50%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        transform: translateY(-50%);
        padding: 0 6px;
        max-height: 160px;
        align-items: center;
        align-self: center;
    }

    .arrow {
        border: none;
        background: var(--button-bg);
        color: var(--text-color);
        opacity: 0.0;
        padding: 4px 8px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.3s;
    }

    .arrow:hover {
        background: rgba(0,0,0,0.8);
        border: none;
        color: white;
        opacity: 1.0;
        padding: 4px 8px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.3s;
    }

</style>
