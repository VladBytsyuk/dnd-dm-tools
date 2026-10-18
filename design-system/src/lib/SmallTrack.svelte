<script lang="ts">
	import Sword from "lucide-svelte/icons/sword";
	import BaseSmallItem from "./BaseSmallItem.svelte";

	type Props = {
		title: string;
		atmosphere?: string;
		source?: string;
		hasCombat?: boolean;
		favorite?: boolean;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
		onclick?: () => void;
	};

	let { title, atmosphere = "", source, hasCombat = false, favorite = false, state, theme = "dark", onclick }: Props = $props();
</script>

<div class="small-track">
	<BaseSmallItem
		primaryColor="var(--ds-track)"
		secondaryColor="var(--ds-track-sub)"
		height={42}
		{title}
		subtitle={atmosphere}
		{source}
		bottomIcons={hasCombat ? [{ icon: Sword, label: "Есть боевой вариант" }] : []}
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
	.small-track { --ds-media-unit: 1.5px; width: 100%; min-width: 0; }
	.small-track :global(.content strong) { font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(14 * var(--ds-media-unit, 1px)); }
	.small-track :global(.content span:not(.title-text)), .small-track :global(.meta span) { font-size: calc(8 * var(--ds-media-unit, 1px)); line-height: calc(10 * var(--ds-media-unit, 1px)); }
	.small-track :global([role="button"]) { cursor: pointer; }
	.small-track :global([role="button"]:focus-visible) { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
</style>
