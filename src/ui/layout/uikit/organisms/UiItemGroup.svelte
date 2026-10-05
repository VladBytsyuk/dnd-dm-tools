<script lang="ts">
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import { getPanelTypeColor, getRedesignPanelTypeColor } from "../PanelTypeColor";
	import PanelTypeTint from "../PanelTypeTint.svelte";
	import RedesignedSmallItem from "src/ui/design-system/RedesignedSmallItem.svelte";

	interface Props {
		panelKey: PanelKey;
		groupTitle: string;
		items: BaseItem[];
		onItemClick: (item: BaseItem) => void;
		SmallItemSlot: any;
		redesignEnabled?: boolean;
		isFavorite?: (url: string) => boolean;
		isOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		showLoadMore?: boolean;
		onLoadMore?: () => void;
	}

	let { panelKey, groupTitle, items, onItemClick, SmallItemSlot, redesignEnabled = false, isFavorite, isOpen = true, onOpenChange, showLoadMore = false, onLoadMore }: Props = $props();
	const groupColor = $derived(redesignEnabled ? getRedesignPanelTypeColor(panelKey) : getPanelTypeColor(panelKey));

	function observeEnd(node: HTMLElement) {
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
		}, { rootMargin: "200px" });
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	function toggleGroup(event: MouseEvent) {
		event.preventDefault();
		const details = (event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
		const open = !details.open;
		details.open = open;
		onOpenChange?.(open);
	}
</script>

<div
	class="item-group"
	style={`--item-group-color: ${groupColor}; --item-group-hover-color: color-mix(in srgb, ${groupColor} 85%, white)`}
>
	<details open={isOpen}>
		<summary class="item-group__title" onclick={toggleGroup}>{groupTitle}</summary>
		<div class="item-group__grid">
		{#each items as item (item.url)}
				<div class:manual-item={item.origin === "manual"}>
					{#if redesignEnabled}
						<RedesignedSmallItem {panelKey} smallItem={item} favorite={isFavorite?.(item.url) ?? false} onItemClick={() => onItemClick(item)} />
					{:else}
						<PanelTypeTint {panelKey}><SmallItemSlot smallItem={item} onItemClick={() => onItemClick(item)} /></PanelTypeTint>
					{/if}
				</div>
			{/each}
		</div>
		{#if isOpen && showLoadMore}
			<div class="item-group__sentinel" use:observeEnd aria-hidden="true"></div>
		{/if}
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

	.manual-item {
		border-radius: var(--dnd-ui-radius-lg);
	}

	.item-group__sentinel {
		height: 1px;
	}

</style>
