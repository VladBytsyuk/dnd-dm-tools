<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		className?: string;
		children?: Snippet;
	}

	let { className = "", children }: Props = $props();
</script>

<div class={`detail-card ${className}`.trim()}>
	<div class="detail-card__body">
		{@render children?.()}
	</div>
</div>

<style>
	.detail-card {
		text-align: left;
		font-size: var(--dnd-ui-font-size-body);
		line-height: var(--dnd-ui-line-height-body);
		display: inline-block;
		vertical-align: top;
		width: 100%;
		background-size: cover;
		background-position: center;
		border-color: var(--dnd-ui-pattern-card-border);
		border-width: 2px;
		background: var(--dnd-ui-pattern-card-bg);
		color: var(--dnd-ui-pattern-card-text);
		border-radius: var(--dnd-ui-radius-lg);
	}

	.detail-card__body {
		padding: 1em;
		box-sizing: border-box;
		font-family: var(--dnd-ui-font-family-body);
		background: var(--dnd-ui-pattern-card-inner-bg);
		color: var(--dnd-ui-pattern-card-text);
		border-radius: var(--dnd-ui-radius-lg);
	}
</style>
