<script lang="ts">
	import type { SmallSpell } from "../../../domain/models/spell/SmallSpell";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallSpell;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
    
    const { name, school, level, source, components } = smallItem;
    const componentsText =
        (components.v ? 'В' : '•') +
        (components.s ? 'С' : '•') +
        (components.m ? 'М' : '•')
</script>

<UiItemCard
    group={level+""}
    name={name}
    source={source}
    left={school}
    right={componentsText}
    onItemClick={onItemClick}
/>
