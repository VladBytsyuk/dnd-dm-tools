<script lang="ts">
	import type { SmallFeat } from "../../../domain/models/feat/SmallFeat";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallFeat;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    
    const name = $derived(smallItem.name);
    const requirements = $derived(smallItem.requirements);
    const source = $derived(smallItem.source);
</script>


<UiItemCard
    group={undefined}
    name={name}
    source={source}
    left={requirements}
    onItemClick={onItemClick}
/>
