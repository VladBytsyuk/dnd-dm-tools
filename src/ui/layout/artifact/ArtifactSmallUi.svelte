<script lang="ts">
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallArtifact;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<UiItemCard
    group={smallItem.rarity.short}
    name={smallItem.name}
    source={smallItem.source}
    left={smallItem.rarity.name}
    right={smallItem.customization ? 'Н' : ''}
    onItemClick={onItemClick}
/>
