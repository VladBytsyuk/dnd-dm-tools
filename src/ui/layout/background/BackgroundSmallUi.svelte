<script lang="ts">
    import type { SmallBackground } from 'src/domain/models/background/SmallBackground';
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallBackground,
        onItemClick: () => void,
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<UiItemCard
    name={smallItem.name}
    source={smallItem.source}
    onItemClick={onItemClick}
/>
