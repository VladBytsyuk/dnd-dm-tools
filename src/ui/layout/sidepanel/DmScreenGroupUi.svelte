<script lang="ts">
    import { onkeydown } from "src/domain/utils";

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
        padding: 16px;
        background-color: #00000028;;
        border-radius: 8px;
        transition: all .15s ease-in-out;
    }
    .dm-screen-item:hover {
        background-color: #00000056;;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
        margin-left: 12px;
    }

    .dm-screen-item .text .name {
        font-weight: 600;
        color: var(--text-color);
    }

    .dm-screen-item .text .description {
        font-weight: 400;
        color: var(--text-color);
    }
</style>
