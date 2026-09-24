<script lang="ts">
	import Plus from "lucide-svelte/icons/plus";
	import type Sword from "lucide-svelte/icons/sword";
	import Chip from "./Chip.svelte";

	type Icon = typeof Sword;

	export type ChipsListItem = {
		text?: string;
		suffix?: string;
		icon?: Icon;
		iconTooltip?: string;
		imageSrc?: string;
		imageAlt?: string;
		href?: string;
		onLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		onTextChange?: (text: string) => void;
		editable?: boolean;
		background?: string;
	};

	type Props = {
		chips?: ChipsListItem[];
		editable?: boolean;
		showAddButton?: boolean;
		theme?: "dark" | "light";
	};

	let { chips = [], editable = false, showAddButton = true, theme = "dark" }: Props = $props();
</script>

<div class="chips-list" data-theme={theme}>
	{#each chips as chip}
		<Chip {...chip} {theme} editable={editable || chip.editable} />
	{/each}
	{#if editable && showAddButton}
		<Chip icon={Plus} {theme} />
	{/if}
</div>

<style>
	.chips-list {
		display: flex;
		flex-flow: row wrap;
		align-items: flex-start;
		gap: 4px;
		width: 100%;
		min-width: 0;
	}
</style>
