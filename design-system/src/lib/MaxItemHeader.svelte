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
		chips?: ChipsListItem[];
		images?: string[];
		alt?: string;
		size?: number;
		initialIndex?: number;
		onChange?: (index: number) => void;
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
		chips = [],
		images = [],
		alt,
		size,
		initialIndex,
		onChange,
	}: Props = $props();

	let coloredChips = $derived(chips.map((chip) => ({ ...chip, background: chip.background ?? accentColor })));
</script>

<section class="max-item-header" style={`--image-size: ${size ?? 128}px`}>
	<div class="content">
		<FullItemHeader {russianName} {englishName} {entityLink} {badge} {info} {source} {onCopy} />
		{#if coloredChips.length > 0}
			<ChipsList chips={coloredChips} />
		{/if}
	</div>

	<ImageGroup {images} {alt} {size} fluid {initialIndex} {onChange} />
</section>

<style>
	.max-item-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, min(var(--image-size), 40%));
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		min-width: 0;
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
