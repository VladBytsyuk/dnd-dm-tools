<script lang="ts">
	import type { SmallFeat } from "../../../domain/models/feat/SmallFeat";
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallFeat;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    
    const { name, requirements, source } = smallItem;
</script>


<SmallItemUi
    group={undefined}
    name={name}
    source={source}
    left={requirements}
    onItemClick={onItemClick}
/>
