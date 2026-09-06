<script lang="ts">
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
	};

	let { chips = [] }: Props = $props();
</script>

<div class="chips-list">
	{#each chips as chip}
		<Chip {...chip} />
	{/each}
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
