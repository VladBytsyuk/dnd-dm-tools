<script lang="ts">
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import { getPanelTypeColor } from "../PanelTypeColor";
	import PanelTypeTint from "../PanelTypeTint.svelte";

	interface Props {
		panelKey: PanelKey;
		groupTitle: string;
		items: BaseItem[];
		onItemClick: (item: BaseItem) => void;
		SmallItemSlot: any;
	}

	let { panelKey, groupTitle, items, onItemClick, SmallItemSlot }: Props = $props();
	const groupColor = $derived(getPanelTypeColor(panelKey));
</script>

<div
	class="item-group"
	style={`--item-group-color: ${groupColor}; --item-group-hover-color: color-mix(in srgb, ${groupColor} 85%, white)`}
>
	<details open>
		<summary class="item-group__title">{groupTitle}</summary>
		<div class="item-group__grid">
			{#each items as item (item.url)}
				<PanelTypeTint {panelKey}>
					<SmallItemSlot smallItem={item} onItemClick={() => onItemClick(item)} />
				</PanelTypeTint>
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
		border-color: var(--item-group-color);
	}

	.item-group__title {
		display: block;
		appearance: none;
		font-size: 1.2rem;
		font-weight: var(--dnd-ui-font-weight-bold);
		width: 100%;
		padding: var(--dnd-ui-space-6) var(--dnd-ui-space-8) var(--dnd-ui-space-6) var(--dnd-ui-space-24);
		margin: 0;
		background: var(--item-group-color) !important;
		border-bottom: 2px solid var(--item-group-color) !important;
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
		background: var(--item-group-hover-color) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title {
		background: var(--item-group-color) !important;
		border-bottom-color: var(--item-group-color) !important;
		color: var(--dnd-ui-text-inverse);
	}

	.item-group details[open] .item-group__title:hover {
		background: var(--item-group-hover-color) !important;
	}

	.item-group details[open] .item-group__title::before {
		transform: translateY(-50%) rotate(90deg);
	}

	.item-group__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(20rem, 100%), 1fr)
		);
		gap: var(--dnd-ui-space-4);
		padding: var(--dnd-ui-space-8) 0 0;
		background: var(--dnd-ui-pattern-group-content-bg);
	}
</style>
