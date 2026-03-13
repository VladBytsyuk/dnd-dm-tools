<script lang="ts">
	import { onMount } from "svelte";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";

	interface Props {
		name: string;
		images?: string[];
		uiEventListener?: IUiEventListener;
	}

	let { name, images = [], uiEventListener }: Props = $props();

	let currentImageIndex = $state(0);
	let imagesState: string[] = $state([]);
	let isImageExpanded = $state(false);

	const imagesLength = $derived(images.length);

	onMount(async () => {
		if (images.length === 0) return;
		if (!uiEventListener) {
			imagesState = images;
			return;
		}
		imagesState = await Promise.all(images.map((image) => uiEventListener.onImageRequested(image)));
	});

	const nextImage = () => {
		if (imagesLength === 0) return;
		currentImageIndex = (currentImageIndex + 1) % imagesLength;
	};

	const prevImage = () => {
		if (imagesLength === 0) return;
		currentImageIndex = (currentImageIndex - 1 + imagesLength) % imagesLength;
	};

	const toggleExpanded = () => {
		isImageExpanded = !isImageExpanded;
	};
</script>

{#if imagesLength > 0}
	<div class="image-gallery">
		<div class="image-gallery__slider">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				class={`image-gallery__image ${isImageExpanded ? "image-gallery__image-expanded" : ""}`}
				src={imagesState[currentImageIndex]}
				alt={name}
				onclick={toggleExpanded}
				onerror={(e) => {
					if (e.target) (e.target as HTMLImageElement).src = "https://ttg.club/img/no-img.webp";
				}}
			/>
			{#if imagesLength > 1}
				<div class="image-gallery__controls">
					<button class="image-gallery__arrow" onclick={prevImage} aria-label="Предыдущее изображение">❮</button>
					<button class="image-gallery__arrow" onclick={nextImage} aria-label="Следующее изображение">❯</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.image-gallery {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 25%;
		max-height: 10%;
		z-index: 1;
		margin: 2em 0.5em 0;
	}

	.image-gallery__slider {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.image-gallery__controls {
		position: absolute;
		top: 50%;
		width: 100%;
		display: flex;
		justify-content: space-between;
		transform: translateY(-50%);
		padding: 0 6px;
		max-height: 160px;
		align-items: center;
	}

	.image-gallery__arrow {
		border: none;
		background: var(--button-bg);
		color: var(--text-color);
		opacity: 0;
		padding: 4px 8px;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.3s, opacity 0.3s;
	}

	.image-gallery__arrow:hover {
		background: rgba(0, 0, 0, 0.8);
		color: white;
		opacity: 1;
	}

	.image-gallery__image {
		max-height: 160px;
		width: auto;
		display: block;
		margin: 0 auto;
		border-radius: 4px;
	}

	.image-gallery__slider:hover .image-gallery__arrow {
		opacity: 0.75;
	}

	.image-gallery__image-expanded {
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

	.image-gallery__image-expanded + .image-gallery__controls {
		z-index: 1001;
	}
</style>
