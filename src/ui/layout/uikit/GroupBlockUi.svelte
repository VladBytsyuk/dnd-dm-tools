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
    }

    .group-title {
        font-size: 1.2rem;
        font-weight: bold;
        width: 100%;
        padding-bottom: 8px;
        margin-bottom: 0.5rem;
        border-bottom: 2px solid var(--text-color);
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
</style>
