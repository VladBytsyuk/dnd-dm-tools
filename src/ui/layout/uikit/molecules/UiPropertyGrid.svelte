<script lang="ts">
	import HtmlBlock from "../HtmlBlock.svelte";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";

	export interface UiPropertyGridItem {
		label: string;
		value?: string | number;
		html?: string;
	}

	interface Props {
		items: UiPropertyGridItem[];
		uiEventListener?: IUiEventListener;
		className?: string;
	}

	let { items, uiEventListener, className = "" }: Props = $props();

	const visibleItems = $derived(items.filter((item) => item.value !== undefined || item.html));
</script>

{#if visibleItems.length > 0}
	<div class={`property-grid ${className}`.trim()}>
		{#each visibleItems as item}
			<div class="property-grid__item">
				<em class="property-grid__title">{item.label}</em>
				{#if item.html}
					<HtmlBlock htmlContent={item.html} {uiEventListener} />
				{:else}
					{item.value}
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.property-grid {
		list-style: none;
		text-align: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: stretch;
		align-content: flex-start;
		padding: 0;
		margin-bottom: 1em;
		background: #ffffff14;
		border-radius: 8px;
	}

	.property-grid__item {
		margin: 1px;
		padding: 4px 6px;
		order: 0;
		flex: 1 1 auto;
		align-self: center;
	}

	.property-grid__title {
		display: block;
		text-transform: uppercase;
		font-weight: bold;
		font-style: normal;
		padding-bottom: 4px;
	}
</style>
