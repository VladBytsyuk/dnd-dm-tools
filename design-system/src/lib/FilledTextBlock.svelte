<script lang="ts">
	import type ChevronRight from "lucide-svelte/icons/chevron-right";
	import TextBlock from "./TextBlock.svelte";

	type Icon = typeof ChevronRight;

	type Props = {
		title?: string;
		text?: string;
		icon?: Icon;
		expanded?: boolean;
		editable?: boolean;
		background?: string;
		theme?: "dark" | "light";
	};

	let {
		title = $bindable(""),
		text = $bindable(""),
		icon: Icon,
		expanded = $bindable(true),
		editable = false,
		background = "rgb(212 212 212 / 40%)",
		theme = "dark",
	}: Props = $props();
</script>

<section class="filled-text-block" data-theme={theme} style:background>
	<TextBlock bind:title bind:text icon={Icon} bind:expanded {editable} {theme} />
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
