<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
    import type { SmallBackground } from 'src/domain/models/background/SmallBackground';
	import SourceLabel from "../uikit/SourceLabel.svelte";

    interface Props {
        smallItem: SmallBackground,
        onItemClick: () => void,
    }
    let { smallItem, onItemClick }: Props = $props();
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
</div>