<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = {
		title: string;
		adventureName?: string;
		musicName?: string;
		info?: string;
		source?: string;
		favorite?: boolean;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
		onclick?: () => void;
	};

	let { title, adventureName, musicName, info, source, favorite = false, state, theme = "dark", onclick }: Props = $props();
</script>

<div class="small-scene">
	<BaseSmallItem
		primaryColor="var(--ds-scene)"
		secondaryColor="var(--ds-scene-sub)"
		height={64}
		{title}
		subtitle={adventureName}
		{source}
		{favorite}
		{state}
		{theme}
		footer={musicName || info ? footer : undefined}
		role={onclick ? "button" : undefined}
		tabindex={onclick ? 0 : undefined}
		aria-label={onclick ? title : undefined}
		{onclick}
		onkeydown={onclick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onclick(); } } : undefined}
	/>
</div>

{#snippet footer()}
	<div class="scene-footer">
		<span class="music" title={musicName}>{#if musicName}♫ {musicName}{/if}</span>
		{#if info}<span class="info" title={info}>{info}</span>{/if}
	</div>
{/snippet}

<style>
	.small-scene { width: 100%; min-width: 0; }
	.small-scene :global(.content strong) { font-size: 12px; line-height: 14px; }
	.small-scene :global(.content span:not(.title-text)), .small-scene :global(.meta span) { font-size: 8px; line-height: 10px; }
	.small-scene :global([role="button"]) { cursor: pointer; }
	.small-scene :global([role="button"]:focus-visible) { outline: 2px solid currentcolor; outline-offset: 2px; }
	.scene-footer { display: flex; gap: 6px; min-width: 0; }
	.scene-footer span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.music { flex: 1; }
	.info { flex: 0 1 auto; max-width: 50%; text-align: right; }
</style>
