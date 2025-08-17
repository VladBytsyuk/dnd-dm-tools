<script lang="ts">
	import type { SmallItem } from "src/domain/models/items/SmallItem";

    interface Props {
        smallItem: SmallItem;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>