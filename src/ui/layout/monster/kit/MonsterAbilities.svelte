<script lang="ts">
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import type { NamedValue } from '../../../../domain/models/common/Skill';

    let { 
		title,
        description,
        items,
		uiEventListener,
	} = $props<{
        title?: string;
        description?: string;
        items: NamedValue[];
        uiEventListener: IUiEventListener;
    }>();
</script>

<div class="property-block">
    {#if title}
        <div class="block-header">{title}</div>
    {/if}
    {#if description}
        <HtmlBlock class="base-info-item-value" htmlContent={description} uiEventListener={uiEventListener} />
    {/if}
    {#each items as item}
        <div class="base-info-item">
            <span class="base-info-item-title">{item.name}.</span>
            <HtmlBlock class="base-info-item-value" htmlContent={item.value} uiEventListener={uiEventListener} />   
        </div>
    {/each}
</div>

<style>
    .base-info-item {
        color: var(--text-color);
        gap: 4px;
        margin: 4px 0px 4px;
    }

    .base-info-item-title {
        color: var(--text-color);
        font-size: 12.5px;
        line-height: 1.2em;
        font-weight: bold;
    }

    :global(.base-info-item-value) {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12.5px;
        line-height: 1.2em;
    }

    .property-block {
        padding: 0.5em 0 0;
        color: var(--text-color);
    }

    .block-header {
        border-bottom: 1px solid;
        border-bottom-color: var(--text-color);
        color: var(--text-color);
        font-size: 16px;
        margin: 0.5em 0 0.5em;
        padding: 0 0 8px;
    }
</style>
