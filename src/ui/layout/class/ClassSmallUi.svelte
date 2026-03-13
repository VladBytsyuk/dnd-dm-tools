<script lang="ts">
    import type { SmallClass } from "../../../domain/models/class/SmallClass";
    import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallClass;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    const { name, dice, source } = smallItem;
</script>

<UiItemCard
    group={dice}
    name={name}
    source={source}
    left={dice}
    onItemClick={onItemClick}
/>
