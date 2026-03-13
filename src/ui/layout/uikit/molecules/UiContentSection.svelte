<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title?: string;
		className?: string;
		children?: Snippet;
	}

	let { title, className = "", children }: Props = $props();
</script>

<div class={`content-section ${className}`.trim()}>
	{#if title}<div class="content-section__title">{title}</div>{/if}
	<div class="content-section__body">
		{@render children?.()}
	</div>
</div>

<style>
	.content-section {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	.content-section__title {
		font-weight: var(--dnd-ui-font-weight-semibold);
		font-size: var(--dnd-ui-font-size-lg);
		margin-bottom: var(--dnd-ui-space-4);
	}
</style>
