<script lang="ts">
	import type { SmallMonster } from "../../../domain/models/monster/SmallMonster";
	import UiItemCard from "../uikit/organisms/UiItemCard.svelte";

    interface Props {
        smallItem: SmallMonster;
        onItemClick: () => void;
    }

    let { smallItem, onItemClick }: Props = $props();
    
    const { name, type, challengeRating, source } = smallItem;
    const typeText = typeof type === "string" ? type : type && typeof type === "object" && "name" in type ? type.name : "";
</script>


<UiItemCard
    group={challengeRating}
    name={name}
    source={source}
    left={typeText}
    onItemClick={onItemClick}
/>
