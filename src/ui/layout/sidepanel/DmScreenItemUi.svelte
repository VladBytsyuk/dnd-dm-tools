<script lang="ts">
	import { TEXTS } from "src/res/texts_ru";
	import HtmlBlock from "../uikit/HtmlBlock.svelte";

    // ---- props ----
    let { item, htmlLinkListener } = $props();
</script>

<div class="item">
    {#if item.name}
    <div class="item-header-box">
        <div class="item-header-title">{item.name.rus} <span class="item-header-subtitle">[{item.name.eng}]</span></div>
    </div>
    {/if}
    <div class="item-content">
        {#if item.parent && item.source}
        <div class="item-content-source">
            {#if item.parent}<div class="item-content-source-left">{TEXTS.dmScreenItemParent}: {item.parent.name.rus}</div>{/if}
            {#if item.source}<div class="item-content-source-right">{TEXTS.dmScreenItemSource}: {item.source.shortName}</div>{/if}
        </div>
        {/if}
        {#if item.description}
        <div class="item-content-text">
            <HtmlBlock htmlContent={item.description} htmlLinkListener={htmlLinkListener} />
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
        border-radius: 8px;
        background: #00000028;
    }

    .item-header-box {
        align-items: center;
        padding: 1em;
        background-color: #ffffff28;   
    }

    .item-header-title {
        font-size: 1.2em;
        font-weight: bold;
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
        background-color: var(--color-background);
        overflow-y: auto;
    }

    .item-content-source {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        padding: 12px;
        background: #ffffff14;
        border-radius: 8px;
    }

    .item-content-source-left {
        flex: 1 1 100%;
        margin-right: 8px;
        font-style: italic;
    }

    .item-content-source-right {
        flex-shrink: 0;
    }   

    .item-content-text {
        margin-top: 1em;
    }
</style>
