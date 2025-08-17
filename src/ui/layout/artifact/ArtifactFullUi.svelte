<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullArtifact } from 'src/domain/models/artifact/FullArtifact';
	import { copyArtifactToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';

    interface Props {
        currentItem: FullArtifact,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    let currentImageIndex = $state(0);
    let imagesLength = $state(currentItem?.images?.length ?? 0);
    let images: string[] = $state([]);
    let isImageExpanded = $state(false);

    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

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
</script>

<div class="body">
    <div class="header">
        <div>
            <div class="name-container">
                <div
                    class="name"
                    role="button"
                    tabindex="0"
                    onclick={() => copyArtifactToClipboard(currentItem)}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyArtifactToClipboard(currentItem); } }}
                    aria-label="Скопировать в буфер обмена"
                >
                    {currentItem.name.rus} 📋
                </div>
                <div class="subname">{currentItem.name.eng}</div>
            </div>
            <div class="info-container">
                {#if currentItem.type}<div class="type">{currentItem.type.name}</div>{/if}
                {#if currentItem.source}<div class="source">Источник: {currentItem.source.shortName}</div>{/if}
            </div>
        </div>
        {#if images?.length}
            <div class="images">
                <div class="slider-container">
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img 
                        class="images-item {isImageExpanded ? 'expanded' : ''}" 
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
    <div class="table">
        <div class="table-item">
            <em class="table-title">Настройка</em>
            {currentItem.customization ? 'Требуется' : 'Не требуется'}
        </div>
        {#if currentItem.cost?.dmg}
            <div class="table-item">
                <em class="table-title">Стоимость DMG</em>
                {currentItem.cost.dmg}
            </div>
        {/if}
        {#if currentItem.cost?.xge}
            <div class="table-item">
                <em class="table-title">Стоимость XGE</em>
                {currentItem.cost.xge}
            </div>
        {/if}
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

    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: top;
        margin-bottom: 1em;
    }

    .name {
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .subname {
        opacity: 0.75;
        font-size: 12px;
        margin: 0 0 2px;
    }

    .info-container {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        padding: 12px;
        background: #ffffff14;
        border-radius: 8px;
    }

    .type {
        flex: 1 1 100%;
        margin-right: 8px;
        font-style: italic;
    }

    .source {
        flex-shrink: 0;
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

    .images {
        display: flex;
        justify-content: center; 
        align-items: center;
        width: 25%;
        max-height: 10%;
        z-index: 1;
        margin: 2em 0.5em 0;
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

    .images-item {
        max-height: 160px;
        width: auto;
        display: block;
        margin: 0 auto;
        border-radius: 4px;
    }

    .images-item.expanded {
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

    .images-item.expanded + .slider-controls {
        z-index: 1001;
    }
</style>