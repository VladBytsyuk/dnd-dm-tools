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

<div class="group">
    <details open>
        <summary class="group-title">{groupTitle}</summary>
        <div class="grid">
            {#each items as item (item.url)}
                <SmallItemSlot smallItem={item} onItemClick={() => onItemClick(item)}/>
            {/each}
        </div>
    </details>
</div>

<style>
    .group {
        margin: 1rem 0;
    }
    
    .group details {
        user-select: none;
        border-radius: 8px;
        transition: all 0.3s ease;
        overflow: hidden;
        marker: none;
    }

    .group details:hover, .group details[open] {
        border-color: var(--interactive-accent);
    }

    .group-title {
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

    .group-title:hover {
        background: var(--interactive-accent);
    }

    .group details[open] .group-title {
        background: var(--interactive-accent);
        border-bottom-color: var(--interactive-accent);
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        padding: 8px 0px 0px;
        background: var(--background-secondary);
    }
</style>
