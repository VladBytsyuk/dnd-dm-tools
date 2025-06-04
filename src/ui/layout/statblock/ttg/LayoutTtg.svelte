<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { TEXTS } from "src/res/texts_ru";
    import { copyMonsterToClipboard } from "src/data/clipboard";
	import { getCurrentTheme, theme, Theme } from 'src/ui/theme';
	import { calculateAndFormatModifier, formatModifier } from 'src/domain/modifier';
	import { DiceRollersManager } from '../../dice-roller/DiceRollersManager';
	import { handleHtml, joinList, joinSpeed, separate } from 'src/domain/utils';
	import { getImageSource } from 'src/domain/image_utils';
	import { registerHtmlLinkListener } from 'src/domain/html_click';

    let { app, monster, isTwoColumns, onRoll, htmlLinkListener } = $props()

    let currentImageIndex = $state(0);
    let imagesLength = $state(monster.images?.length ?? 0);
    let images: string[] = $state([]);
    let isImageExpanded = $state(false);
    
    const diceRollersManager = new DiceRollersManager(onRoll);
    
    onMount(async () => {
        diceRollersManager.onMount();
        if (monster.images) {
            images = await Promise.all(monster.images?.map(async (it: string) => await getImageSource(app, it)));
        }
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });

    const nextImage = () => {
        currentImageIndex = (currentImageIndex + 1) % imagesLength;
    };

    const prevImage = () => {
        currentImageIndex = (currentImageIndex - 1 + imagesLength) % imagesLength;
    };

    const handleOverlayClick = (e: MouseEvent) => {
        const target = e?.target as HTMLElement;
        if (target?.classList?.contains('expanded')) {
            isImageExpanded = false;
        }
    }

    let themeClass = $state(getCurrentTheme() === Theme.Light ? 'theme-ttg-light' : 'theme-ttg-dark');

    $effect(() => {
        const unsubscribe = theme.subscribe(value => {
            themeClass = value === Theme.Light ? 'theme-ttg-light' : 'theme-ttg-dark';
        });

        return () => { unsubscribe() };
    });

    const linkListener = registerHtmlLinkListener(htmlLinkListener);   
</script>
  
<div class="layout-ttg {themeClass}">
    <div class={`layout-ttg-statblock ${isTwoColumns ? 'layout-ttg-statblock-wide' : ''}`}>

        <div class="layout-ttg-statblock-section-horizontal">

            <div class="layout-ttg-statblock-section-horizontal-header">
                <!-- Header -->
                <div class="layout-ttg-statblock-header">
                    <div
                        class="layout-ttg-statblock-header-name"
                        role="button"
                        tabindex="0"
                        onclick={() => copyMonsterToClipboard(monster)}
                        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyMonsterToClipboard(monster); } }}
                        aria-label="{TEXTS.copyToClipboard}"
                    >
                        {monster.name.rus} 📋
                    </div>
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
                        <span class="layout-ttg-statblock-base-info-item-value">
                            {monster.hits.average} (<dice-roller label={TEXTS.layoutHits} formula="{monster.hits.formula}{monster.hits.sign}{monster.hits.bonus}">{monster.hits.formula}{monster.hits.sign}{monster.hits.bonus}</dice-roller>)
                        </span>
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
            {#if images?.length && !isTwoColumns}
            <div class="layout-ttg-statblock-images">
                <div class="slider-container">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img 
                        class="layout-ttg-statblock-images-item {isImageExpanded ? 'expanded' : ''}" 
                        src={images[currentImageIndex]} 
                        alt={monster.name.rus}
                        onclick={(e) => { isImageExpanded = !isImageExpanded; handleOverlayClick(e); }}
                        onerror={(e) => { if (e.target) (e.target as HTMLImageElement).src = "https://ttg.club/img/no-img.webp"; } }/>
                    {#if imagesLength > 1}
                    <div class="slider-controls">
                        <button class="arrow left" onclick={prevImage}>❮</button>
                        <button class="arrow right" onclick={nextImage}>❯</button>
                    </div>
                    {/if}
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
                <div class="layout-ttg-statblock-scores-table-item-value" use:linkListener>
                    <dice-roller label={entry[0]} formula={"к20+" + calculateAndFormatModifier(entry[1])}>
                        {entry[1]} ({calculateAndFormatModifier(entry[1])})
                    </dice-roller>
                </div>
                </div>
            {/each}
            </div>
        {/if}

        <!-- Base Info 2 -->
        <div class="layout-ttg-statblock-base-info">
            {#if monster.savingThrows}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSaves}</span> 
                <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>
                    {@html separate(monster.savingThrows.map(it => 
                        `${it.name} <dice-roller label="${TEXTS.layoutSave}. ${it.name}" formula="к20${formatModifier(it.value)}">${formatModifier(it.value)}</dice-roller>`
                    ))}
                </span>
            </div>
            {/if}

            {#if monster.skills}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">{TEXTS.layoutSkills}</span> 
                <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>
                    {@html separate(monster.skills.map(it => 
                        `${it.name} <dice-roller label="${TEXTS.layoutSkill}. ${it.name}" formula="к20${formatModifier(it.value)}">${formatModifier(it.value)}</dice-roller>`
                    ))}
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
                    <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>{@html handleHtml(feat.value)}</span>     
                </div>
            {/each}
            </div>
        {/if}

        <!-- Action Blocks -->
        {#each [
            { action: monster.actions, title: TEXTS.layoutActions},
            { action: monster.bonusActions, title: TEXTS.layoutBonusActions},
            { action: monster.reactions, title: TEXTS.layoutReactions},
        ] as item}
            {#if item.action != undefined} 
                {#if item.action.length}
                <div class="layout-ttg-statblock-property-block">
                    <div class="layout-ttg-statblock-block-header">{item.title}</div>
                    {#each item.action as action}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{action.name}.</span>
                        <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>{@html handleHtml(action.value)}</span>
                    </div>
                    {/each}
                </div>
                {/if}
            {/if}
        {/each}

        {#if monster.legendary}
        <div class="layout-ttg-statblock-property-block">
            <div class="layout-ttg-statblock-block-header">{TEXTS.layoutLegendaryActions}</div>
            {#if monster.legendary?.description}
                <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>{@html handleHtml(monster.legendary.description)}</span>
            {/if}
            {#each monster.legendary?.list as action}
                <div class="layout-ttg-statblock-base-info-item">
                    <span class="layout-ttg-statblock-base-info-item-title">{action.name}.</span>
                    <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>{@html handleHtml(action.value)}</span>
                </div>
            {/each}
        </div>
        {/if}

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
                    <span class="layout-ttg-statblock-base-info-item-value" use:linkListener>{@html handleHtml(item.action)}</span>
                </div>
            </div>
            {/if}
        {/each}

        <!-- Description -->
        {#if monster.description}
            <details class="layout-ttg-statblock-generic-block">
                <summary class="layout-ttg-statblock-block-header">{TEXTS.layoutDescription}</summary>
                <div class="layout-ttg-statblock-generic-description" use:linkListener>{@html handleHtml(monster.description)}</div>
            </details>
        {/if}

        <!-- Tags -->
        {#each monster.tags as tag}
            <details class="layout-ttg-statblock-generic-block">
                <summary class="layout-ttg-statblock-block-header">{tag.name}</summary>
                <div class="layout-ttg-statblock-generic-description" use:linkListener>{@html handleHtml(tag.description)}</div>
            </details>
        {/each}
    </div>
</div>


<style>
    :global(.theme-ttg-light) {
        --accent-bg: #00000014;
        --accent-bg-sub: #00000007;
        --button-bg: rgba(0,0,0,0.1);
    }

    :global(.theme-ttg-dark) {
        --accent-bg: #ffffff0d;
        --accent-bg-sub: #ffffff06;
        --button-bg: rgba(255,255,255,0.1);
    }

    .layout-ttg {
        display: inline-block;
        position: relative;
        overflow: visible;
        background: #00000020;
        border-radius: 8px;
        border-color: #00000090;
        border-width: 2px;
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
        color: var(--text-color);
        opacity: 0.75;
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
        color: var(--text-color);
        opacity: 0.75;
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
        border-bottom-color: var(--text-color);
        color: var(--text-color);
        font-size: 16px;
        margin: 0.5em 0 0.5em;
        padding: 0 0 8px;
    }

    .layout-ttg-statblock-generic-block {
        padding: 0.5em;
        color: var(--text-color);
        margin: 0.5em;
        background: var(--accent-bg);
        border-radius: 8px;
        cursor: pointer;
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

    .layout-ttg-statblock-images-item.expanded {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-height: 90vh;
        max-width: 90vw;
        z-index: 1000;
        cursor: zoom-out;
        box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.8);
        background: rgba(0, 0, 0, 0.8);
    }

    .layout-ttg-statblock-images-item.expanded + .slider-controls {
        z-index: 1001;
    }

</style>
