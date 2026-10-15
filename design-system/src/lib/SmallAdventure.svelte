<script lang="ts">
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = {
		title: string;
		playlistName?: string;
		sceneCount?: number;
		source?: string;
		favorite?: boolean;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
		onclick?: () => void;
	};

	let { title, playlistName, sceneCount = 0, source, favorite = false, state, theme = "dark", onclick }: Props = $props();
	const pluralRules = new Intl.PluralRules("ru");
	let count = $derived(Number.isFinite(sceneCount) ? Math.max(0, Math.floor(sceneCount)) : 0);
	let countLabel = $derived(`${count} ${pluralRules.select(count) === "one" ? "сцена" : pluralRules.select(count) === "few" ? "сцены" : "сцен"}`);
</script>

<div class="small-adventure">
	<BaseSmallItem
		primaryColor="var(--ds-adventure)"
		secondaryColor="var(--ds-adventure-sub)"
		height={64}
		{title}
		{source}
		{favorite}
		{state}
		{theme}
		{footer}
		role={onclick ? "button" : undefined}
		tabindex={onclick ? 0 : undefined}
		aria-label={onclick ? title : undefined}
		{onclick}
		onkeydown={onclick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onclick(); } } : undefined}
	/>
</div>

{#snippet footer()}
	<div class="adventure-footer">
		<span class="music" title={playlistName}>{#if playlistName}♫ {playlistName}{/if}</span>
		<span class="count">{countLabel}</span>
	</div>
{/snippet}

<style>
	.small-adventure { width: 100%; min-width: 0; }
	.small-adventure :global(.content strong) { font-size: 12px; line-height: 14px; }
	.small-adventure :global(.meta span) { font-size: 8px; line-height: 10px; }
	.small-adventure :global([role="button"]) { cursor: pointer; }
	.small-adventure :global([role="button"]:focus-visible) { outline: 2px solid currentcolor; outline-offset: 2px; }
	.adventure-footer { display: flex; gap: 6px; min-width: 0; }
	.music { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.count { flex: 0 0 auto; text-align: right; }
</style>
