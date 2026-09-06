<script lang="ts">
	import ChipsList, { type ChipsListItem } from "./ChipsList.svelte";
	import FullItemHeader, { type FullItemSource } from "./FullItemHeader.svelte";
	import ImageGroup from "./ImageGroup.svelte";

	type Props = {
		accentColor?: string;
		russianName: string;
		englishName: string;
		entityLink: string;
		badge?: string | number;
		info?: string;
		source?: FullItemSource;
		onCopy?: (text: string) => void;
		onNameClick?: (name: string) => void | Promise<void>;
		chips?: ChipsListItem[];
		images?: string[];
		alt?: string;
		size?: number;
		initialIndex?: number;
		onChange?: (index: number) => void;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		accentColor = "rgb(212 212 212 / 40%)",
		russianName,
		englishName,
		entityLink,
		badge,
		info,
		source,
		onCopy,
		onNameClick,
		chips = [],
		images = [],
		alt,
		size,
		initialIndex,
		onChange,
		editable = false,
		theme = "dark",
	}: Props = $props();

	let coloredChips = $derived(chips.map((chip) => ({ ...chip, background: chip.background ?? accentColor })));
	let hasImage = $derived(images.length > 0 || editable);
</script>

<section class:hasImage class="max-item-header" data-theme={theme} style={`--image-size: ${size ?? 128}px`}>
	<div class="content">
		<FullItemHeader {russianName} {englishName} {entityLink} {badge} {info} {source} {onCopy} {onNameClick} {editable} {theme} />
		{#if coloredChips.length > 0 || editable}
			<ChipsList chips={coloredChips} {editable} {theme} />
		{/if}
	</div>

	<ImageGroup {images} {alt} {size} fluid {initialIndex} {onChange} {editable} {theme} />
</section>

<style>
	.max-item-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		min-width: 0;
	}

	.max-item-header.hasImage {
		grid-template-columns: minmax(0, 1fr) minmax(0, min(var(--image-size), 40%));
	}

	.max-item-header :global(.image-group) {
		min-width: 0;
	}

	.content {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}
</style>
