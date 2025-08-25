<script lang="ts">
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallArtifact;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<SmallItemUi
    group={smallItem.rarity.short}
    name={smallItem.name}
    source={smallItem.source}
    left={smallItem.rarity.name}
    right={smallItem.customization ? 'Н' : ''}
    onItemClick={onItemClick}
/>