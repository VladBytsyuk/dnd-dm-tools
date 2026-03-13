<script lang="ts">
	import type { SmallItem } from "src/domain/models/items/SmallItem";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallItem;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<UiItemCard
    name={smallItem.name}
    source={smallItem.source}
    onItemClick={onItemClick}
/>
