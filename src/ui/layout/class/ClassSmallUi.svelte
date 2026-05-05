<script lang="ts">
    import type { SmallClass } from "../../../domain/models/class/SmallClass";
    import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallClass;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    const name = $derived(smallItem.name);
    const dice = $derived(smallItem.dice);
    const source = $derived(smallItem.source);
</script>

<UiItemCard
    group={dice}
    name={name}
    source={source}
    left={dice}
    onItemClick={onItemClick}
/>
