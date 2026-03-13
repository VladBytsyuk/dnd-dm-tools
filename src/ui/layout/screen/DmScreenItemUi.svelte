<script lang="ts">
	import { copyDmScreenItem } from "src/data/clipboard";
	import HtmlBlock from "../uikit/HtmlBlock.svelte";
	import UiCopyableText from "../uikit/atoms/UiCopyableText.svelte";
	import UiItemMetaRow from "../uikit/molecules/UiItemMetaRow.svelte";

    // ---- props ----
    let { currentItem, uiEventListener } = $props();
</script>

<div class="item">
    {#if currentItem.name}
    <div class="item-header-box">
        <div class="item-header-title">
            <UiCopyableText
                text={currentItem.name.rus}
                onClick={() => copyDmScreenItem(currentItem)}
                className="item-header-copy"
            />
            <span class="item-header-subtitle">[{currentItem.name.eng}]</span>
        </div>
    </div>
    {/if}
    <div class="item-content">
        {#if currentItem.parent && currentItem.source}
        <UiItemMetaRow
            type={currentItem.parent ? `Раздел: ${currentItem.parent.name.rus}` : undefined}
            source={currentItem.source}
            className="item-content-source"
        />
        {/if}
        {#if currentItem.description}
        <div class="item-content-text">
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </div>
        {/if}
    </div>
</div>

<style>
    .item {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--dnd-ui-radius-lg);
        background: var(--dnd-ui-surface-panel-strong);
    }

    .item-header-box {
        align-items: center;
        padding: 1em;
        background-color: var(--dnd-ui-surface-muted-strong);
    }

    .item-header-title {
        font-size: var(--dnd-ui-font-size-xl);
        font-weight: var(--dnd-ui-font-weight-bold);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .item-header-subtitle {
        font-size: 0.8em;
        font-weight: normal;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        opacity: 0.8;
        margin-top: 0.2em;
    }

    .item-content {
        flex: 1;
        padding: 1em;
        background-color: var(--dnd-ui-surface-base);
        overflow-y: auto;
    }

    .item-content-text {
        margin-top: 1em;
    }
</style>
