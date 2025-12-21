<script lang="ts">
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
	import type { Lair } from 'src/domain/models/common/Lair';

    let { 
		lair, 
		uiEventListener,
	} = $props<{
        lair: Lair;
        uiEventListener: IUiEventListener;
    }>();
</script>
  
{#each [
    { action: lair.description, title: "Логово"},
    { action: lair.action, title: "Действия логова"},
    { action: lair.effect, title: "Региональные эффекты"},
] as item}
    {#if item.action != undefined} 
    <div class="property-block">
        <div class="block-header">{item.title}</div>
        <div class="base-info-item">
            <HtmlBlock class="base-info-item-value" htmlContent={item.action} uiEventListener={uiEventListener} /> 
        </div>
    </div>
    {/if}
{/each}

<style>
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
