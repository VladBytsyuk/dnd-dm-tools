<script lang="ts">
	import Plus from "lucide-svelte/icons/plus";
	import type Sword from "lucide-svelte/icons/sword";
	import Chip from "./Chip.svelte";

	type Icon = typeof Sword;

	export type ChipsListItem = {
		text?: string;
		icon?: Icon;
		iconTooltip?: string;
		imageSrc?: string;
		imageAlt?: string;
		editable?: boolean;
		background?: string;
	};

	type Props = {
		chips?: ChipsListItem[];
		editable?: boolean;
	};

	let { chips = [], editable = false }: Props = $props();
</script>

<div class="chips-list">
	{#each chips as chip}
		<Chip {...chip} editable={editable || chip.editable} />
	{/each}
	{#if editable}
		<Chip icon={Plus} />
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
