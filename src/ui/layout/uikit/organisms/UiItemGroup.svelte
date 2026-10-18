<script lang="ts">
	import type { Snippet } from "svelte";
	import { Plus } from "lucide-svelte";
	import UiCollapsibleGroup from "./UiCollapsibleGroup.svelte";
	import type { BaseItem } from "src/domain/models/common/BaseItem";
	import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
	import { getRedesignPanelTypeColor } from "../PanelTypeColor";
	import RedesignedSmallItem from "src/ui/design-system/RedesignedSmallItem.svelte";

	interface Props {
		panelKey: PanelKey;
		groupTitle: string;
		items: BaseItem[];
		onItemClick: (item: BaseItem) => void;
		itemContent?: Snippet<[BaseItem]>;
		onAdd?: () => void;
		color?: string;
		isFavorite?: (url: string) => boolean;
		isOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		showLoadMore?: boolean;
		onLoadMore?: () => void;
	}

	let { panelKey, groupTitle, items, onItemClick, itemContent, onAdd, color, isFavorite, isOpen = $bindable(true), onOpenChange, showLoadMore = false, onLoadMore }: Props = $props();
	const groupColor = $derived(color ?? getRedesignPanelTypeColor(panelKey));
	function observeEnd(node: HTMLElement) {
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) onLoadMore?.();
		}, { rootMargin: "200px" });
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

{#snippet addAction()}
	<button class="group-add" type="button" aria-label={`Добавить: ${groupTitle}`} onclick={(event) => { event.preventDefault(); event.stopPropagation(); onAdd?.(); }} onkeydown={(event) => event.stopPropagation()}><Plus size={16} aria-hidden={true} /></button>
{/snippet}

<UiCollapsibleGroup title={groupTitle} color={groupColor} bind:isOpen {onOpenChange} headerActions={onAdd ? addAction : undefined}>
	<div class="item-group__grid">
		{#each items as item (item.url)}
			<div class:manual-item={item.origin === "manual"}>
				{#if itemContent}{@render itemContent(item)}
				{:else}
					<RedesignedSmallItem {panelKey} smallItem={item} favorite={isFavorite?.(item.url) ?? false} onItemClick={() => onItemClick(item)} />
				{/if}
			</div>
		{/each}
	</div>
	{#if isOpen && showLoadMore}
		<div class="item-group__sentinel" use:observeEnd aria-hidden="true"></div>
	{/if}
</UiCollapsibleGroup>

<style>
	.group-add { all: unset; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 24px; height: 24px; cursor: pointer; }
	.group-add:focus-visible { outline: 2px solid currentcolor; }
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
