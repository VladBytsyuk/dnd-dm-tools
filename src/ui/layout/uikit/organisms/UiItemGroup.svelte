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
		margin: 1rem 0;
	}

	.item-group details {
		user-select: none;
		border-radius: 8px;
		transition: all 0.3s ease;
		overflow: hidden;
		marker: none;
	}

	.item-group details:hover,
	.item-group details[open] {
		border-color: var(--interactive-accent);
	}

	.item-group__title {
		font-size: 1.2rem;
		font-weight: bold;
		width: 100%;
		padding: 4px 8px;
		margin: 0;
		background: var(--background-primary);
		border-bottom: 2px solid var(--background-modifier-border);
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	.item-group__title:hover {
		background: var(--interactive-accent);
	}

	.item-group details[open] .item-group__title {
		background: var(--interactive-accent);
		border-bottom-color: var(--interactive-accent);
	}

	.item-group__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 8px 0 0;
		background: var(--background-secondary);
	}
</style>
