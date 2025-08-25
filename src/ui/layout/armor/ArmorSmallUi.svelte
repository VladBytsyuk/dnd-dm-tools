<script lang="ts">
	import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallArmor;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<SmallItemUi
    name={smallItem.name}
    source={smallItem.source}
    left={smallItem.armorClass}
    right={smallItem.price}
    onItemClick={onItemClick}
/>