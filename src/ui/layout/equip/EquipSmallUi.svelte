<script lang="ts">
	import type { SmallItem } from "src/domain/models/items/SmallItem";
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallItem;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<SmallItemUi
    name={smallItem.name}
    source={smallItem.source}
    onItemClick={onItemClick}
/>