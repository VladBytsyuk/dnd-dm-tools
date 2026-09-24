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
		html?: string;
		onHtmlChange?: (html: string) => void;
		onEntityLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		editable?: boolean;
		background?: string;
	};

	type Props = {
		chips?: ChipsListItem[];
		editable?: boolean;
		showAddButton?: boolean;
		onAddChip?: () => void;
		theme?: "dark" | "light";
	};

	let { chips = [], editable = false, showAddButton = true, onAddChip, theme = "dark" }: Props = $props();
</script>

<div class="chips-list" data-theme={theme}>
	{#each chips as chip}
		<Chip {...chip} {theme} editable={editable || chip.editable} />
	{/each}
	{#if editable && showAddButton}
		<button class="add-chip" type="button" aria-label="Добавить чип" disabled={!onAddChip} onclick={onAddChip}>
			<Plus size={10} strokeWidth={1.5} />
		</button>
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

	.add-chip {
		display: inline-grid;
		width: 16px;
		height: 16px;
		place-items: center;
		padding: 2px;
		border: 0;
		border-radius: 4px;
		background: rgb(212 212 212 / 40%);
		color: inherit;
		cursor: pointer;
	}

	.add-chip:focus-visible { outline: 1px solid currentcolor; outline-offset: 2px; }
	.add-chip:disabled { cursor: not-allowed; opacity: 0.45; }
</style>
