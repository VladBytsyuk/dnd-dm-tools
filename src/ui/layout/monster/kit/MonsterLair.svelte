<script lang="ts">
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
	import type { Lair } from 'src/domain/models/common/Lair';

    let { 
		lair,
        isInEditMode,
		uiEventListener,
	} = $props<{
        lair: Lair;
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
    }>();
</script>

<div>
    {#if isInEditMode || lair.description} 
        <div class="property-block">
            <div class="block-header">Логово</div>
            <div class="base-info-item">
                {#if isInEditMode}
                    <textarea class="textarealike editable" bind:value={lair.description} rows="3"></textarea> 
                {:else if lair.description}
                    <HtmlBlock class="base-info-item-value" htmlContent={lair.description} uiEventListener={uiEventListener} />
                {/if}
            </div>
        </div>
    {/if}
    {#if isInEditMode || lair.action} 
        <div class="property-block">
            <div class="block-header">Действия логова</div>
            <div class="base-info-item">
                {#if isInEditMode}
                    <textarea class="textarealike editable" bind:value={lair.action} rows="3"></textarea> 
                {:else if lair.action}
                    <HtmlBlock class="base-info-item-value" htmlContent={lair.action} uiEventListener={uiEventListener} />
                {/if}
            </div>
        </div>
    {/if}
    {#if isInEditMode || lair.effect} 
        <div class="property-block">
            <div class="block-header">Региональные эффекты</div>
            <div class="base-info-item">
                {#if isInEditMode}
                    <textarea class="textarealike editable" bind:value={lair.effect} rows="3"></textarea> 
                {:else if lair.effect}
                    <HtmlBlock class="base-info-item-value" htmlContent={lair.effect} uiEventListener={uiEventListener} />
                {/if}
            </div>
        </div>
    {/if}
</div>

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

	.textarealike {
        flex: 1 1 auto;
	    width: 100%;
		border: 1px solid transparent;
		background: transparent;
		border-radius: 8px;
        field-sizing: content;
		outline: none;
		background: var(--background-secondary);
        text-overflow: ellipsis;
        color: var(--text-color);
    }

    .editable {
        opacity: 0.75;
        font-size: 12.5px;
        line-height: 1.2em;
		border-color: var(--interactive-accent);
    }
</style>
