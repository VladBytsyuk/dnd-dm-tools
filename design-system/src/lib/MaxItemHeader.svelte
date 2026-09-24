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
		sourceSuffix?: string;
		wrapRussianName?: boolean;
		onCopy?: (text: string) => void;
		onNameClick?: (name: string) => void | Promise<void>;
		onInfoChange?: (info: string) => void;
		chips?: ChipsListItem[];
		secondaryChips?: ChipsListItem[];
		images?: string[];
		alt?: string;
		size?: number;
		initialIndex?: number;
		onChange?: (index: number) => void;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		accentColor = "#d4d4d4",
		russianName = $bindable(""),
		englishName = $bindable(""),
		entityLink = $bindable(""),
		badge,
		info = $bindable<string | undefined>(),
		source = $bindable<FullItemSource | undefined>(),
		sourceSuffix = "",
		wrapRussianName = false,
		onCopy,
		onNameClick,
		onInfoChange,
		chips = [],
		secondaryChips = [],
		images = [],
		alt,
		size,
		initialIndex,
		onChange,
		editable = false,
		theme = "dark",
	}: Props = $props();

	let coloredChips = $derived(chips.map((chip) => ({ ...chip, background: chip.background ?? accentColor })));
	let coloredSecondaryChips = $derived(secondaryChips.map((chip) => ({ ...chip, background: chip.background ?? accentColor })));
	let hasImage = $derived(images.length > 0 || editable);
</script>

<section class:hasImage class="max-item-header" data-theme={theme} style={`--image-size: ${size ?? 128}px`}>
	<div class="content">
		<FullItemHeader
			bind:russianName
			bind:englishName
			bind:entityLink
			{badge}
			bind:info
			bind:source
			{sourceSuffix}
			{wrapRussianName}
			{onCopy}
			{onNameClick}
			{onInfoChange}
			{editable}
			{theme}
		/>
		{#if coloredChips.length > 0 || editable}
			<ChipsList chips={coloredChips} {editable} {theme} />
		{/if}
		{#if coloredSecondaryChips.length > 0}
			<ChipsList chips={coloredSecondaryChips} showAddButton={false} {editable} {theme} />
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
