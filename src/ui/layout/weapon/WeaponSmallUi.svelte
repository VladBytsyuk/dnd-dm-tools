<script lang="ts">
	import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
	import SmallItemUi from "../uikit/SmallItemUi.svelte";

    interface Props {
        smallItem: SmallWeapon;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
 
    const diceText = smallItem.damage.dice ? smallItem.damage.dice + " ": "";
    const leftText = `${diceText}${smallItem.damage.type ?? ''}`;
</script>

<SmallItemUi
    name={smallItem.name}
    source={smallItem.source}
    left={leftText} 
    right={smallItem.price}
    onItemClick={onItemClick}
/>