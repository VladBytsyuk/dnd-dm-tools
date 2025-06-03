<script lang="ts">
	import { TEXTS } from "src/res/texts_ru";

    // ---- props ----
    let { item } = $props();
</script>

<div class="item">
    <div class="item-header-box">
        <div class="item-header-title">{item.name.rus} <span class="item-header-subtitle">[{item.name.eng}]</span></div>
    </div>
    <div class="item-content">
        <div class="item-content-source">
            <div class="item-content-source-left">{TEXTS.dmScreenItemParent}: {item.parent.name.rus}</div>
            <div class="item-content-source-right">{TEXTS.dmScreenItemSource}: {item.source.shortName}</div>
        </div>
        <div class="item-content-text">{@html item.description}</div>
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
    }
</style>
