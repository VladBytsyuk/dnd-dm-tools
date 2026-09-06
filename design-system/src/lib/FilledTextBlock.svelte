<script lang="ts">
	import type ChevronRight from "lucide-svelte/icons/chevron-right";
	import TextBlock from "./TextBlock.svelte";

	type Icon = typeof ChevronRight;

	type Props = {
		title?: string;
		text?: string;
		html?: string;
		icon?: Icon;
		expanded?: boolean;
		accentColor?: string;
		onSpellLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		editable?: boolean;
		background?: string;
		theme?: "dark" | "light";
	};

	let {
		title = $bindable(""),
		text = $bindable(""),
		html,
		icon: Icon,
		expanded = true,
		accentColor = "#d4d4d4",
		onSpellLinkClick,
		editable = false,
		background = "rgb(212 212 212 / 40%)",
		theme = "dark",
	}: Props = $props();
</script>

<section class="filled-text-block" data-theme={theme} style:background>
	{#if editable}
		<TextBlock bind:title bind:text {html} icon={Icon} {expanded} {accentColor} {onSpellLinkClick} {editable} {theme} />
	{:else}
		<TextBlock {title} {text} {html} icon={Icon} {expanded} {accentColor} {onSpellLinkClick} {theme} />
	{/if}
</section>

<style>
	.filled-text-block {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		padding: 4px;
		border-radius: 8px;
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
	}
</style>
