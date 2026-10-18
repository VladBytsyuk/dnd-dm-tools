<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = {
		title: string;
		atmosphere?: string;
		source?: string;
		trackCount?: number;
		favorite?: boolean;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
		onclick?: () => void;
	};

	let { title, atmosphere = "", source, trackCount = 0, favorite = false, state, theme = "dark", onclick }: Props = $props();
	const pluralRules = new Intl.PluralRules("ru");
	let count = $derived(Number.isFinite(trackCount) ? Math.max(0, Math.floor(trackCount)) : 0);
	let countLabel = $derived(`${count} ${pluralRules.select(count) === "one" ? "трек" : pluralRules.select(count) === "few" ? "трека" : "треков"}`);
</script>

<div class="small-playlist">
	<BaseSmallItem
		primaryColor="var(--ds-playlist)"
		secondaryColor="var(--ds-playlist-sub)"
		height={40}
		metaWidth={64}
		{title}
		subtitle={atmosphere}
		{source}
		secondarySource={countLabel}
		{favorite}
		{state}
		{theme}
		role={onclick ? "button" : undefined}
		tabindex={onclick ? 0 : undefined}
		aria-label={onclick ? title : undefined}
		{onclick}
		onkeydown={onclick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onclick(); } } : undefined}
	/>
</div>

<style>
	.small-playlist { --ds-media-unit: 1.5px; width: 100%; min-width: 0; }
	.small-playlist :global(.titles) { gap: 0; }
	.small-playlist :global(.content strong) { font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(14 * var(--ds-media-unit, 1px)); }
	.small-playlist :global(.content span:not(.title-text)), .small-playlist :global(.meta span) { font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.small-playlist :global([role="button"]) { cursor: pointer; }
	.small-playlist :global([role="button"]:focus-visible) { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
</style>
