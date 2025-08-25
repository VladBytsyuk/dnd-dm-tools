<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
	import SourceLabel from "../uikit/SourceLabel.svelte";
	import type { Name } from "src/domain/models/common/Name";
	import type { Source } from 'src/domain/models/common/Source.ts';

    interface Props {
        group?: string;
        name?: Name;
        source?: Source;
        left?: string;
        right?: string;
        onItemClick: () => void;
    }
    let { group, name, source, left, right, onItemClick }: Props = $props();
</script>

<div 
    class="small-item__container" 
    role="button"
    tabindex="0"
    onclick={onItemClick}
    onkeydown={onkeydown(onItemClick)}
>   
    {#if group}
        <div class="small-item__group">{group}</div>
    {/if}
    <div class="small-item__body">
        <div class="small-item__row">
            {#if name}
                <div class="small-item__name-block">
                    <h4 class="small-item__rus-name">{name.rus}</h4>
                    <p class="small-item__eng-name">[{name.eng}]</p>
                </div>
            {/if} 
            {#if source}<SourceLabel source={source} />{/if}
        </div>
        {#if left || right}
            <div class="small-item__row">
                {#if left}<div class="small-item__left">{left}</div>{/if}
                {#if right}<div class="small-item__right">{right}</div>{/if}
            </div>
        {/if}
    </div>
</div>