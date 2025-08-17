<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
	import SourceLabel from "../uikit/SourceLabel.svelte";
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";

    interface Props {
        smallItem: SmallArtifact;
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
        <div class="rarity">{smallItem.rarity.name}</div>
        <div class="customization">{smallItem.customization ? 'Н' : ''}</div>
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

    .rarity {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
    }
    
    .customization {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
        white-space: nowrap; 
        margin-left: auto; 
    }
</style>