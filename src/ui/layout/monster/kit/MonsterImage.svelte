<script lang="ts">
    import { onMount } from 'svelte';
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';

    let { 
		currentItem, 
		uiEventListener, 
	} = $props<{
        currentItem: FullMonster;
        uiEventListener: IUiEventListener;
    }>();

    let currentImageIndex = $state(0);
    let imagesLength = $state(currentItem?.images?.length ?? 0);
    let images: string[] = $state([]);
    let isImageExpanded = $state(false);
    
    onMount(async () => {
        if (currentItem?.images) {
            images = await Promise.all(currentItem?.images?.map(async (it: string) => await uiEventListener.onImageRequested(it)));
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

<style>
    .images {
        display: flex;
        justify-content: center; 
        align-items: center;
        width: 25%;
        z-index: 1;
        margin: 2em 0.5em 0;
    }

    .images-item {
        max-height: 160px;
        width: auto;
        display: block;
        margin: 0 auto;
        border-radius: 4px;
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
