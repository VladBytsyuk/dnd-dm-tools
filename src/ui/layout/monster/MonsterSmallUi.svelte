<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
	import SourceLabel from "../uikit/SourceLabel.svelte";

    let { smallItem, onItemClick } = $props();
    const { name, type, challengeRating, source } = smallItem;
</script>

<div 
    class="bestiary-small"
    role="button"
    tabindex="0"
    onclick={onItemClick}
    onkeydown={onkeydown(onItemClick)}
>
    <div class="rating">
        <span>{challengeRating}</span>
    </div>
    <div class="body">
        <div class="row">
            <div class="name">
                <span class="name--rus">{name.rus}</span>
                <span class="name--eng"> [{name.eng}]</span>
            </div>
            <SourceLabel source={source} />
        </div>
        <div class="row">
            <div class="type">{type}</div>
        </div>
    </div>
</div>

<style>
    .bestiary-small {
        display: flex;
        flex-direction: row;
        align-items: initial;
        min-height: 38px;
        padding: 6px 12px;
        background: #00000040;
        border-radius: 12px;
    }

    .bestiary-small:hover {
        background: #00000060;
    }

    .rating {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        margin-left: -8px;
        text-align: center;
        font-weight: 900;
        color: var(--text-color);
    }

    .body {
        overflow: hidden;
        display: flex;
        flex: 1 1 100%;
        flex-direction: column;
        justify-content: center;
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
    
    .type {
        font-size: 13px;
        line-height: normal;
        color: var(--text-color);
        opacity: 0.5;
    }
</style>