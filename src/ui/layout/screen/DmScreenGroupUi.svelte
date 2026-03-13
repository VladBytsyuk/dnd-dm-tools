<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";

    let { icon, name, source, onclick } = $props();  
</script>

<div 
    class="dm-screen-item"
    role="button"
    tabindex="0"
    onclick={onclick}
    onkeydown={onkeydown(onclick)}
>
    {#if icon}<i class="icon">{@html icon}</i>{/if}
    <div class="text">
        <div class="name">{name.rus}</div>
        <div class="description">{source} / {name.eng}</div>
    </div>
</div>

<style>
    .dm-screen-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        padding: var(--dnd-ui-space-16);
        background-color: var(--dnd-ui-surface-panel-strong);
        border-radius: var(--dnd-ui-radius-lg);
        transition: all var(--dnd-ui-duration-fast) var(--dnd-ui-ease-standard);
    }
    .dm-screen-item:hover {
        background-color: var(--dnd-ui-surface-panel-hover);
        box-shadow: var(--dnd-ui-shadow-sm);
    }
    .dm-screen-item:active {
        transform: scale(0.98);
    }

    .dm-screen-item .icon {
        flex-shrink: 0;
        width: 4em;
        height: 4em;
        color: var(--accent-color);
        transform: translateZ(0);
        overflow: hidden;
        display: inline-block;
        flex-shrink: 0;
        font-size: var(--b3c6e880);
        line-height: 4em;
        color: currentColor;
        text-align: center;
        fill: currentColor;
    }       

    .dm-screen-item .text {
        margin-left: var(--dnd-ui-space-12);
    }

    .dm-screen-item .text .name {
        font-weight: var(--dnd-ui-font-weight-semibold);
        color: var(--dnd-ui-text-secondary);
    }

    .dm-screen-item .text .description {
        font-weight: 400;
        color: var(--dnd-ui-text-secondary);
    }
</style>
