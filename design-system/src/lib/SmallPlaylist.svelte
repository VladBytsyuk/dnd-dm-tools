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
	.small-playlist { width: 100%; min-width: 0; }
	.small-playlist :global(.titles) { gap: 0; }
	.small-playlist :global(.content strong) { font-size: 12px; line-height: 14px; }
	.small-playlist :global(.content span:not(.title-text)), .small-playlist :global(.meta span) { font-size: 8px; line-height: 10px; }
	.small-playlist :global([role="button"]) { cursor: pointer; }
	.small-playlist :global([role="button"]:focus-visible) { outline: 2px solid currentcolor; outline-offset: 2px; }
</style>
