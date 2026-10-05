<script lang="ts">
	import Plus from "lucide-svelte/icons/plus";
	import type Sword from "lucide-svelte/icons/sword";
	import Chip from "./Chip.svelte";

	type Icon = typeof Sword;

	export type ChipsListItem = {
		text?: string;
		placeholder?: string;
		suffix?: string;
		toggle?: boolean;
		active?: boolean;
		onToggle?: () => void;
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
	function hasContent(chip: ChipsListItem): boolean {
		if (chip.editable) return true;
		if (chip.toggle) return Boolean(chip.active);
		if (chip.icon && !chip.onTextChange && !chip.onHtmlChange) return true;
		return Boolean(chip.text?.trim() || chip.suffix?.trim() || chip.imageSrc?.trim()
			|| chip.html?.replace(/<[^>]*>/gu, " ").replace(/(?:&nbsp;|&#160;|&#xA0;)/giu, " ").trim());
	}
	let visibleChips = $derived(editable ? chips : chips.filter(hasContent));
</script>

<div class="chips-list" data-theme={theme}>
	{#each visibleChips as chip}
		<Chip {...chip} {theme} editable={editable || chip.editable} />
	{/each}
	{#if editable && showAddButton && onAddChip}
		<button class="add-chip" type="button" aria-label="Добавить чип" onclick={onAddChip}>
			<Plus size={15} strokeWidth={1.5} />
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
		all: unset;
		box-sizing: border-box;
		display: inline-grid;
		height: 19px;
		width: 19px;
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
