<script lang="ts">
	import type { BaseItem } from "src/domain/models/common/BaseItem";

	interface Props {
		groupTitle: string;
		items: BaseItem[];
		onItemClick: (item: BaseItem) => void;
		SmallItemSlot: any;
	}

	let { groupTitle, items, onItemClick, SmallItemSlot }: Props = $props();
</script>

<div class="item-group">
	<details open>
		<summary class="item-group__title">{groupTitle}</summary>
		<div class="item-group__grid">
			{#each items as item (item.url)}
				<SmallItemSlot smallItem={item} onItemClick={() => onItemClick(item)} />
			{/each}
		</div>
	</details>
</div>

<style>
	.item-group {
		margin: 0;
	}

	.item-group details {
		user-select: none;
		border-radius: var(--dnd-ui-radius-lg);
		transition: all var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
		overflow: hidden;
		marker: none;
		border: 1px solid var(--dnd-ui-pattern-list-item-border);
		background: var(--dnd-ui-pattern-group-bg);
	}

	.item-group details:hover,
	.item-group details[open] {
		border-color: var(--dnd-ui-accent-primary);
	}

	.item-group__title {
		display: block;
		appearance: none;
		font-size: 1.2rem;
		font-weight: var(--dnd-ui-font-weight-bold);
		width: 100%;
		padding: var(--dnd-ui-space-6) var(--dnd-ui-space-8) var(--dnd-ui-space-6) var(--dnd-ui-space-24);
		margin: 0;
		background: var(--text-accent) !important;
		border-bottom: 2px solid var(--text-accent) !important;
		cursor: pointer;
		transition: all var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
		position: relative;
		color: var(--dnd-ui-text-inverse);
		list-style: none;
	}

	.item-group__title::-webkit-details-marker {
		display: none;
	}

	.item-group__title::before {
		content: "▶";
		position: absolute;
		left: var(--dnd-ui-space-8);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--dnd-ui-font-size-sm);
		transition: transform var(--dnd-ui-duration-base) var(--dnd-ui-ease-standard);
	}

	.item-group__title:hover {
		background: var(--text-accent-hover) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title {
		background: var(--text-accent) !important;
		border-bottom-color: var(--text-accent) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title::before {
		transform: translateY(-50%) rotate(90deg);
	}

	.item-group__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--dnd-ui-space-4);
		padding: var(--dnd-ui-space-8) 0 0;
		background: var(--dnd-ui-pattern-group-content-bg);
	}
</style>
