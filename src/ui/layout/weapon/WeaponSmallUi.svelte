<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
	import SourceLabel from "../uikit/SourceLabel.svelte";
	import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";

    interface Props {
        smallItem: SmallWeapon;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<div 
    class="body"
    role="button"
    tabindex="0"
    onclick={onItemClick}
    onkeydown={onkeydown(onItemClick)}
>
    <div class="row">
        <div class="name">
            <span class="name--rus">{smallItem.name.rus}</span>
            <span class="name--eng"> [{smallItem.name.eng}]</span>
        </div>
        <SourceLabel source={smallItem.source} />
    </div>
    <div class="row">
        <div class="damage">{smallItem.damage.dice} {smallItem.damage.type}</div>
        <div class="price">{smallItem.price}</div>
    </div>
</div>

<style>
    .body {
        overflow: hidden;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        justify-content: center;
        min-height: 32px;
        padding: 6px 12px;
        background: #00000040;
        border-radius: 12px;
    }

    .body:hover {
        background: #00000060;
    }

    .row {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
    }

    .name {
        overflow: hidden;
        display: inline-block;
        width: 100%;
        font-size: 14px;
        line-height: 19px;
        color: var(--text-color);
        text-overflow: ellipsis;
    }

    .name--rus {
        display: inline;
        max-width: 100%;
        color: var(--text-color);
    }

    .name--eng {
        display: inline;
        color: var(--text-color);
        opacity: 0.5;
    }

    .damage {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
    }
    
    .price {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
        white-space: nowrap; 
        margin-left: auto; 
    }
</style>