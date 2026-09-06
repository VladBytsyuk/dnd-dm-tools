<script lang="ts">
	import ChevronLeft from "lucide-svelte/icons/chevron-left";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import Plus from "lucide-svelte/icons/plus";
	import Chip from "./Chip.svelte";

	type Props = {
		images?: string[];
		alt?: string;
		size?: number;
		fluid?: boolean;
		initialIndex?: number;
		onChange?: (index: number) => void;
		editable?: boolean;
	};

	function getInitialIndex() {
		return Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0));
	}

	let {
		images = $bindable<string[]>([]),
		alt = "Изображение",
		size = 128,
		fluid = false,
		initialIndex = 0,
		onChange,
		editable = false,
	}: Props = $props();
	let currentIndex = $state(getInitialIndex());
	let currentImage = $derived(images[currentIndex]);
	let hasControls = $derived(images.length > 1);

	function showImage(index: number) {
		currentIndex = (index + images.length) % images.length;
		onChange?.(currentIndex);
	}
</script>

{#if editable}
	<div class="image-inputs">
		{#each images as _, index}
			<input bind:value={images[index]} aria-label={`Ссылка на изображение ${index + 1}`} />
		{/each}
		<Chip icon={Plus} />
	</div>
{:else if currentImage}
	<div class:fluid class="image-group" style={`--image-size: ${size}px`}>
		<img src={currentImage} {alt} />
		{#if hasControls}
			<div class="controls" aria-label="Переключение изображений">
				<button type="button" onclick={() => showImage(currentIndex - 1)} aria-label="Предыдущее изображение">
					<ChevronLeft size={24} strokeWidth={1.5} />
				</button>
				<button type="button" onclick={() => showImage(currentIndex + 1)} aria-label="Следующее изображение">
					<ChevronRight size={24} strokeWidth={1.5} />
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.image-group {
		position: relative;
		width: var(--image-size);
		height: var(--image-size);
	}

	.image-inputs {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 4px;
		width: 100%;
		min-width: 0;
		font-family: "Golos Text", sans-serif;
	}

	.image-inputs input {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		padding: 4px 6px;
		border: 0;
		border-radius: 4px;
		outline: 0;
		background: rgb(212 212 212 / 40%);
		color: #fff;
		font: inherit;
		font-size: 10px;
		line-height: 12px;
	}

	.image-inputs input:focus-visible {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	.image-inputs :global(.chip) {
		align-self: center;
	}

	.image-group.fluid {
		width: min(var(--image-size), 100%);
		height: auto;
		aspect-ratio: 1;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 12px;
		object-fit: cover;
	}

	.controls {
		position: absolute;
		bottom: 6px;
		left: 50%;
		display: flex;
		gap: 10px;
		transform: translateX(-50%);
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}

	.image-group:hover .controls, .image-group:focus-within .controls {
		opacity: 1;
		pointer-events: auto;
	}

	.controls button {
		display: grid;
		width: 62px;
		height: 32px;
		place-items: center;
		padding: 0;
		border: 0.5px solid #fff;
		border-radius: 4px;
		background: rgb(0 0 0 / 20%);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		cursor: pointer;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.controls button:hover, .controls button:focus-visible {
		background: rgb(0 0 0 / 30%);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.controls button:active {
		background: rgb(0 0 0 / 40%);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
	}

	.controls button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
</style>
