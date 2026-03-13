<script lang="ts">
	import { onkeydown } from "src/domain/utils/utils";
	import type { Name } from "src/domain/models/common/Name";
	import type { Source } from "src/domain/models/common/Source";
	import UiSourceBadge from "../atoms/UiSourceBadge.svelte";

	interface Props {
		group?: string;
		name?: Name;
		source?: Source;
		left?: string;
		right?: string;
		onItemClick: () => void;
	}

	let { group, name, source, left, right, onItemClick }: Props = $props();
</script>

<div
	class="item-card"
	role="button"
	tabindex="0"
	onclick={onItemClick}
	onkeydown={onkeydown(() => onItemClick())}
>
	{#if group}
		<div class="item-card__group">{group}</div>
	{/if}
	<div class="item-card__body">
		<div class="item-card__row">
			{#if name}
				<div class="item-card__name">
					<h4 class="item-card__name-rus">{name.rus}</h4>
					<p class="item-card__name-eng">[{name.eng}]</p>
				</div>
			{/if}
			{#if source}<UiSourceBadge {source} />{/if}
		</div>
		{#if left || right}
			<div class="item-card__row">
				{#if left}<div class="item-card__left">{left}</div>{/if}
				{#if right}<div class="item-card__right">{right}</div>{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.item-card {
		display: flex;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		background: #00000020;
		cursor: pointer;
	}

	.item-card:hover,
	.item-card:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 1px;
	}

	.item-card__group {
		flex: 0 0 auto;
		min-width: 2.5em;
		text-align: center;
		font-weight: 700;
		align-self: center;
	}

	.item-card__body {
		flex: 1 1 auto;
		min-width: 0;
	}

	.item-card__row {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		justify-content: space-between;
	}

	.item-card__name {
		min-width: 0;
	}

	.item-card__name-rus {
		margin: 0;
		font-size: 14px;
	}

	.item-card__name-eng {
		margin: 0;
		opacity: 0.75;
		font-size: 11px;
	}

	.item-card__left,
	.item-card__right {
		font-size: 12px;
		opacity: 0.85;
	}

	.item-card__right {
		text-align: right;
		white-space: nowrap;
	}
</style>
