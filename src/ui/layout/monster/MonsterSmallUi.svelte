<script lang="ts">
	import type { SmallMonster } from "../../../domain/models/monster/SmallMonster";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallMonster;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    
    const name = $derived(smallItem.name);
    const type = $derived(smallItem.type);
    const challengeRating = $derived(smallItem.challengeRating);
    const source = $derived(smallItem.source);
    const typeText = $derived(typeof type === "string" ? type : type && typeof type === "object" && "name" in type ? type.name : "");
</script>


<UiItemCard
    group={challengeRating}
    name={name}
    source={source}
    left={typeText}
    onItemClick={onItemClick}
/>
