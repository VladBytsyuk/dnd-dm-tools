<script lang="ts">
	import type { SmallFeat } from "../../../domain/models/feat/SmallFeat";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallFeat;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    
    const { name, requirements, source } = smallItem;
</script>


<UiItemCard
    group={undefined}
    name={name}
    source={source}
    left={requirements}
    onItemClick={onItemClick}
/>
