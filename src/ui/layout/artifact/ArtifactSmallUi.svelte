<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
	import SourceLabel from "../uikit/SourceLabel.svelte";
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";

    interface Props {
        smallItem: SmallArtifact;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();

    let rarityThemeName: string;
    if (smallItem) {
        switch (smallItem.rarity.short) {
            case "O":
                rarityThemeName = "common";
                break;
            case "Н":
                rarityThemeName = "uncommon";
                break;
            case "Р":
                rarityThemeName = "rare";
                break;
            case "OР":
                rarityThemeName = "very-rare";
                break;
            case "Л":
                rarityThemeName = "legendary";
                break;
            case "А":
                rarityThemeName = "artifact";
                break;
            default:
                rarityThemeName = "default"
        }
    } else {
        rarityThemeName = "default";
    }
    let rarityTheme = $state(rarityThemeName);
</script>

<div 
    class="small-item small-item__body" 
    role="button"
    tabindex="0"
    onclick={onItemClick}
    onkeydown={onkeydown(onItemClick)}
>
    <div class="small-item__row">
        <div class="small-item__name-block">
            <h4 class="small-item__rus-name">{smallItem.name.rus}</h4>
            <p class="small-item__eng-name">[{smallItem.name.eng}]</p>
        </div>
        <SourceLabel source={smallItem.source} />
    </div>
    <div class="small-item__row">
        <div class="small-item__left {rarityTheme}">{smallItem.rarity.name}</div>
        <div class="small-item__right">{smallItem.customization ? 'Н' : ''}</div>
    </div>
</div>

<style>
    .common {
        color: #FFFFFF;
    }
    .uncommon {
        color: #8aff91;
    }
    .rare {
        color: #a5f1ff;
    }
    .very-rare {
        color: #e770ff;
    }
    .legendary {
        color: #f6ff00;
    }
    .artifact {
        color: #ff8900;
    }
    .default {
        color: #888888FF;
    }
</style>