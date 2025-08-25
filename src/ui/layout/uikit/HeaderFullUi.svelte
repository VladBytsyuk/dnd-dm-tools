<script lang="ts">
	import type { Source } from './../../../domain/models/common/Source.ts';
	import type { Name } from "../../../domain/models/common/Name";
	import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener.js';
	import { onMount } from 'svelte';

    interface Props {
        name: Name;
        type?: string;
        source?: Source;
        onClick: () => void;
        images?: string[];
        uiEventListener?: IUiEventListener;
    }

    let { name, type, source, onClick, images, uiEventListener }: Props = $props();

    let currentImageIndex = $state(0);
    let imagesLength = $state(images?.length ?? 0);
    let imagesState: string[] = $state([]);
    let isImageExpanded = $state(false);

    onMount(async () => {
        if (images && uiEventListener) {
            imagesState = await Promise.all(
                images.map(async (it: string) => 
                    await uiEventListener.onImageRequested(it)
                )
            );
        }
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

<div class="header">
    {#if images?.length}    
        <div>
            <div class="name-container">
                <div
                    class="name-rus"
                    role="button"
                    tabindex="0"
                    onclick={onClick}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(); } }}
                    aria-label="Скопировать в буфер обмена"
                >
                    {name.rus} 📋
                </div>
                <div class="name-eng">{name.eng}</div>
            </div>
            <div class="info-container">
                {#if type}<div class="type">{type}</div>{/if}
                {#if source}<div class="source">Источник: {source.shortName}</div>{/if}
            </div>
        </div>
        <div class="images">
            <div class="slider-container">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <img 
                    class="images-item {isImageExpanded ? 'expanded' : ''}" 
                    src={imagesState[currentImageIndex]} 
                    alt={name.rus}
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
    {:else}
        <div class="name-container">
            <div
                class="name-rus"
                role="button"
                tabindex="0"
                onclick={onClick}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(); } }}
                aria-label="Скопировать в буфер обмена"
            >
                {name.rus} 📋
            </div>
            <div class="name-eng">{name.eng}</div>
        </div>
        <div class="info-container">
            {#if type}<div class="type">{type}</div>{/if}
            {#if source}<div class="source">Источник: {source.shortName}</div>{/if}
        </div>
    {/if}
</div>

<style>
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1em;
    }

    .name-rus {
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .name-eng {
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