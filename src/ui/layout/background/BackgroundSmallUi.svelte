<script lang="ts">
    import type { SmallBackground } from 'src/domain/models/background/SmallBackground';
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallBackground,
        onItemClick: () => void,
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<SmallItemUi
    name={smallItem.name}
    source={smallItem.source}
    onItemClick={onItemClick}
/>