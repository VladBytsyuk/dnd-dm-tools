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
		font-size: 12.5px;
		line-height: 1.2em;
		display: inline-block;
		vertical-align: top;
		width: 100%;
		background-size: cover;
		background-position: center;
		border-color: #00000090;
		border-width: 2px;
		background: #00000020;
		color: var(--text-color);
		border-radius: 8px;
	}

	.detail-card__body {
		padding: 1em;
		box-sizing: border-box;
		font-family: "Open Sans", sans-serif;
		background: var(--bg-color);
		color: var(--text-color);
		border-radius: 8px;
	}
</style>
