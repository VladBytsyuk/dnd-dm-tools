<script lang="ts">
	import type { SmallSpell } from "../../../domain/models/spell/SmallSpell";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallSpell;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
    
    const name = $derived(smallItem.name);
    const school = $derived(smallItem.school);
    const level = $derived(smallItem.level);
    const source = $derived(smallItem.source);
    const components = $derived(smallItem.components);
    const componentsText = $derived(
        (components.v ? 'В' : '•') +
        (components.s ? 'С' : '•') +
        (components.m ? 'М' : '•')
    );
</script>

<UiItemCard
    group={level+""}
    name={name}
    source={source}
    left={school}
    right={componentsText}
    onItemClick={onItemClick}
/>
