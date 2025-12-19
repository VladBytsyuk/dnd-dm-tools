<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { copyMonsterToClipboard } from "src/data/clipboard";
	import { calculateAndFormatModifier, formatModifier } from 'src/domain/modifier';
	import { diceRoller, joinList, joinSpeed, separate } from 'src/domain/utils/utils';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullMonster } from '../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';

    let { currentItem, uiEventListener, isTwoColumns = false } = $props<{
        currentItem: FullMonster, 
        uiEventListener: IUiEventListener, 
        isTwoColumns: boolean
    }>();

    let currentImageIndex = $state(0);
    let imagesLength = $state(currentItem?.images?.length ?? 0);
    let images: string[] = $state([]);
    let isImageExpanded = $state(false);
    
    const diceRollersManager = DiceRollersManager.create(uiEventListener);
    
    onMount(async () => {
        diceRollersManager.onMount();
        if (currentItem?.images) {
            images = await Promise.all(currentItem?.images?.map(async (it: string) => await uiEventListener.onImageRequested(it)));
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

    const notEmpty = (list: any[] | undefined): boolean => {
        return list !== undefined && list.length > 0;
    }
</script>
  
{#if currentItem}
<div class="layout-ttg">
    <div class={`layout-ttg-statblock ${isTwoColumns ? 'layout-ttg-statblock-wide' : ''}`}>

        <div class="layout-ttg-statblock-section-horizontal">

            <div class="layout-ttg-statblock-section-horizontal-header">
                <!-- Header -->
                <div class="layout-ttg-statblock-header">
                    <div
                        class="layout-ttg-statblock-header-name"
                        role="button"
                        tabindex="0"
                        onclick={() => copyMonsterToClipboard(currentItem)}
                        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyMonsterToClipboard(currentItem); } }}
                        aria-label="Скопировать в буфер обмена"
                    >
                        {currentItem.name.rus} 📋
                    </div>
                    <div class="layout-ttg-statblock-header-subname">{currentItem.name.eng}</div>
                    <div class="layout-ttg-statblock-header-block">
                        {#if currentItem.size || currentItem.type || currentItem.alignment}
                        <div class="layout-ttg-statblock-header-subtitle">
                            {[currentItem.size?.rus, currentItem.type?.name].filter(Boolean).join(' ')}
                            {currentItem.alignment ? `, ${currentItem.alignment}` : ''}
                            {currentItem.size?.eng || currentItem.size?.cell ? '/ ' : ''}
                            {currentItem.size?.eng ? currentItem.size.eng: ' '}
                            {currentItem.size?.cell ? currentItem.size.cell: ''}
                        </div>
                        {/if}
                        {#if currentItem.source}
                        <div class="layout-ttg-statblock-header-source">
                            Источник: {currentItem.source.name} ({currentItem.source.shortName})
                        </div>
                        {/if}
                    </div>
                </div>

                <!-- Base Info -->
                <div class="layout-ttg-statblock-base-info">
                    {#if currentItem.armorClass}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">Класс доспеха</span> 
                        <span class="layout-ttg-statblock-base-info-item-value">
                            {currentItem.armorClass}
                            {#if currentItem.armors?.length}
                            ({joinList(currentItem.armors)})
                            {/if}
                        </span>
                    </div>
                    {/if}

                    {#if currentItem.hits}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">Хиты</span>
                        <span class="layout-ttg-statblock-base-info-item-value">
                            {currentItem.hits.average} (<dice-roller label="Хиты" formula="{currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}">{currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}</dice-roller>)
                        </span>
                    </div>
                    {/if}

                    {#if currentItem.speed}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">Скорость</span> 
                        {#if currentItem.speed?.length}
                        <span class="layout-ttg-statblock-base-info-item-value">{joinSpeed(currentItem.speed)}</span>
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
                        alt={currentItem.name.rus}
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
        {#if currentItem.ability}
            <div class="layout-ttg-statblock-scores-table">
            {#each Object.entries({
                ["СИЛ"]: currentItem.ability.str,
                ["ЛОВ"]: currentItem.ability.dex,
                ["ТЕЛ"]: currentItem.ability.con,
                ["ИНТ"]: currentItem.ability.int,
                ["МУД"]: currentItem.ability.wiz,
                ["ХАР"]: currentItem.ability.cha
            }) as entry}
                <div class="layout-ttg-statblock-scores-table-item">
                <div class="layout-ttg-statblock-scores-table-item-title"><b>{entry[0]}</b></div>
                <div class="layout-ttg-statblock-scores-table-item-value">
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
            {#if notEmpty(currentItem.savingThrows)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Спасброски</span> 
                <HtmlBlock class="layout-ttg-statblock-base-info-item-value"
                    htmlContent={
                        separate(currentItem.savingThrows.map((it: { name: string; value: number }) => 
                            diceRoller(`Спасбросок. ${it.name}`, `к20${formatModifier(it.value)}`, `${it.name} ${formatModifier(it.value)}`)
                        ))
                    }
                    uiEventListener={uiEventListener}
                />
            </div>
            {/if}

            {#if notEmpty(currentItem.skills)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Навыки</span> 
                <HtmlBlock
                    class="layout-ttg-statblock-base-info-item-value"
                    htmlContent={
                        separate(currentItem.skills.map((it: { name: string; value: number }) => 
                            diceRoller(`Навык. ${it.name}`, `к20${formatModifier(it.value)}`, `${it.name} ${formatModifier(it.value)}`)
                        ))
                    }
                    uiEventListener={uiEventListener}
                />
            </div>
            {/if}

            {#if notEmpty(currentItem.damageVulnerabilities)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Уязвимость к урону</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(currentItem.damageVulnerabilities)}</span>
            </div>
            {/if}

            {#if notEmpty(currentItem.damageResistances)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Сопротивление к урону</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(currentItem.damageResistances)}</span>
            </div>
            {/if}

            {#if notEmpty(currentItem.damageImmunities)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Иммунитет к урону</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(currentItem.damageImmunities)}</span>
            </div>
            {/if}

            {#if notEmpty(currentItem.conditionImmunities)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Иммунитет к состоянию</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(currentItem.conditionImmunities)}</span>
            </div>
            {/if}

            {#if notEmpty(currentItem.senses)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Чувства</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {currentItem.senses.senses ? 
                        separate(currentItem.senses.senses.map((it: { name: string; value: number }) => `${it.name} ${it.value} фт.,`)) : 
                        ''}
                    пассивная внимательность {currentItem.senses.passivePerception}
                </span>
            </div>
            {/if}

            {#if notEmpty(currentItem.languages)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Языки</span> 
                <span class="layout-ttg-statblock-base-info-item-value">{separate(currentItem.languages)}</span>
            </div>
            {/if}

            {#if notEmpty(currentItem.challengeRating)}
            <div class="layout-ttg-statblock-base-info-item">
                <span class="layout-ttg-statblock-base-info-item-title">Опасность</span> 
                <span class="layout-ttg-statblock-base-info-item-value">
                    {currentItem.challengeRating + (currentItem.experience ? ` (${currentItem.experience} XP)` : '')}
                </span>
            </div>
            {/if}
        </div>

        <!-- Abilities Block -->
        {#if notEmpty(currentItem.feats)}
            <div class="layout-ttg-statblock-property-block">
            {#each currentItem.feats as feat}
                <div class="layout-ttg-statblock-base-info-item">
                    <span class="layout-ttg-statblock-base-info-item-title">{feat.name}.</span>
                    <HtmlBlock class="layout-ttg-statblock-base-info-item-value" htmlContent={feat.value} uiEventListener={uiEventListener} />  
                </div>
            {/each}
            </div>
        {/if}

        <!-- Action Blocks -->
        {#each [
            { action: currentItem.actions, title: "Действия"},
            { action: currentItem.bonusActions, title: "Бонусные действия"},
            { action: currentItem.reactions, title: "Реакции"},
        ] as item}
            {#if item.action != undefined} 
                {#if item.action.length}
                <div class="layout-ttg-statblock-property-block">
                    <div class="layout-ttg-statblock-block-header">{item.title}</div>
                    {#each item.action as action}
                    <div class="layout-ttg-statblock-base-info-item">
                        <span class="layout-ttg-statblock-base-info-item-title">{action.name}.</span>
                        <HtmlBlock class="layout-ttg-statblock-base-info-item-value" htmlContent={action.value} uiEventListener={uiEventListener} />   
                    </div>
                    {/each}
                </div>
                {/if}
            {/if}
        {/each}

        {#if currentItem.legendary && notEmpty(currentItem.legendary.list)}
        <div class="layout-ttg-statblock-property-block">
            <div class="layout-ttg-statblock-block-header">Легендарные действия</div>
            {#if currentItem.legendary?.description}
                <HtmlBlock class="layout-ttg-statblock-base-info-item-value" htmlContent={currentItem.legendary.description} uiEventListener={uiEventListener} />
            {/if}
            {#each currentItem.legendary?.list as action}
                <div class="layout-ttg-statblock-base-info-item">
                    <span class="layout-ttg-statblock-base-info-item-title">{action.name}.</span>
                    <HtmlBlock class="layout-ttg-statblock-base-info-item-value" htmlContent={action.value} uiEventListener={uiEventListener} />
                </div>
            {/each}
        </div>
        {/if}

        <!-- Lair Blocks -->
        {#each [
            { action: currentItem.lair?.description, title: "Логово"},
            { action: currentItem.lair?.action, title: "Действия логова"},
            { action: currentItem.lair?.effect, title: "Региональные эффекты"},
        ] as item}
            {#if item.action != undefined} 
            <div class="layout-ttg-statblock-property-block">
                <div class="layout-ttg-statblock-block-header">{item.title}</div>
                <div class="layout-ttg-statblock-base-info-item">
                    <HtmlBlock class="layout-ttg-statblock-base-info-item-value" htmlContent={item.action} uiEventListener={uiEventListener} /> 
                </div>
            </div>
            {/if}
        {/each}

        <!-- Description -->
        {#if currentItem.description}
            <details class="layout-ttg-statblock-generic-block">
                <summary class="layout-ttg-statblock-block-header">Описание</summary>
                <div class="layout-ttg-statblock-generic-description">
                    <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
                </div>
            </details>
        {/if}

        <!-- Tags -->
        {#each currentItem.tags as tag}
            <details class="layout-ttg-statblock-generic-block">
                <summary class="layout-ttg-statblock-block-header">{tag.name}</summary>
                <div class="layout-ttg-statblock-generic-description">
                    <HtmlBlock htmlContent={tag.description} uiEventListener={uiEventListener} />
                </div>
            </details>
        {/each}
    </div>
</div>
{/if}

<style>
    :global(.theme-light) {
        --accent-bg: #00000014;
        --accent-bg-sub: #00000007;
        --button-bg: rgba(0,0,0,0.1);
    }

    :global(.theme-dark) {
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

    :global(.layout-ttg-statblock-base-info-item-value) {
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
