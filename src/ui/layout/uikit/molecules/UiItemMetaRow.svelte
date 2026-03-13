<script lang="ts">
	import UiSourceBadge from "../atoms/UiSourceBadge.svelte";
	import type { Source } from "src/domain/models/common/Source";

	interface Props {
		type?: string;
		source?: Source;
		className?: string;
	}

	let { type, source, className = "" }: Props = $props();
</script>

{#if type || source}
	<div class={`item-meta-row ${className}`.trim()}>
		{#if type}<div class="item-meta-row__type">{type}</div>{/if}
		{#if source}<div class="item-meta-row__source"><UiSourceBadge {source} /></div>{/if}
	</div>
{/if}

<style>
	.item-meta-row {
		display: flex;
		gap: var(--dnd-ui-space-12);
		justify-content: space-between;
		padding: var(--dnd-ui-space-12);
		background: var(--dnd-ui-pattern-meta-bg);
		border-radius: var(--dnd-ui-radius-lg);
	}

	.item-meta-row__type {
		flex: 1 1 100%;
		margin-right: var(--dnd-ui-space-8);
		font-style: italic;
	}

	.item-meta-row__source {
		display: flex;
		flex-shrink: 0;
		align-items: flex-start;
	}

	.item-meta-row__source :global(.source-badge) {
		margin-left: 0;
	}
</style>
