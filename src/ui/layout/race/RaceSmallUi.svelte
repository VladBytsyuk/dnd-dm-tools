<script lang="ts">
    import type { SmallRace } from 'src/domain/models/race/SmallRace';
    import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallRace,
        onItemClick: () => void,
    }
    let { smallItem, onItemClick }: Props = $props();

    const abilitiesText = smallItem.abilities
        .map(a => a.value !== 0 ? `${a.value > 0 ? '+' : ''}${a.value} ${a.shortName}` : a.shortName)
        .join(', ');
</script>

<UiItemCard
    name={smallItem.name}
    source={smallItem.source}
    left={abilitiesText}
    right={smallItem.type.name}
    onItemClick={onItemClick}
/>
