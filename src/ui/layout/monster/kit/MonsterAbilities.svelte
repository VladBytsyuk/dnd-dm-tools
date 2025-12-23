<script lang="ts">
	import { Plus, X } from 'lucide-svelte';
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
	import { EmptyNamedValue, type NamedValue } from '../../../../domain/models/common/Skill';
	import IconButton from '../../uikit/IconButton.svelte';

    let { 
		title,
        description,
        items,
        isInEditMode,
		uiEventListener,
        onItemsChange = () => {}
	} = $props<{
        title?: string;
        description?: string;
        items: NamedValue[];
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
        onItemsChange: (items: string[]) => {};
    }>();

    const addItem = () => {
        items ? items.push(EmptyNamedValue()) : items = [EmptyNamedValue()];
        onItemsChange(items);
    }
    const removeItem = (index: number) => {
        items.splice(index, 1);
        onItemsChange(items);
    }
</script>

<div class="property-block">
    {#if title}
        <div class="block-header">{title}</div>
    {/if}

    {#if isInEditMode}
        <textarea class="textarealike editable" bind:value={description} rows="3"></textarea> 
    {:else if description}
        <HtmlBlock class="base-info-item-value" htmlContent={description} uiEventListener={uiEventListener} />
    {/if}

    {#each items as item, index}
        <div class="base-info-item">
            {#if isInEditMode}
                <div class="row">
                    <input class="base-info-item-title inputlike"
                        class:editable={isInEditMode}
                        bind:value={item.name}
                        readonly={!isInEditMode} 
                        />.&nbsp;
                    {#if isInEditMode}<IconButton icon={X} size={12} hint="Удалить {item.name}" onClick={() => removeItem(index)}/>{/if}
                </div>
                <textarea class="textarealike editable" bind:value={item.value} rows="3"></textarea>
            {:else}
                <span class="base-info-item-title">{item.name}.</span>
                <HtmlBlock class="base-info-item-value" htmlContent={item.value} uiEventListener={uiEventListener} />
            {/if}
        </div>
    {/each}
    {#if isInEditMode}
        <div class="plus-button">
            <IconButton icon={Plus} size={16} hint="Добавить" onClick={addItem}/>
        </div>
    {/if}
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
        text-wrap: nowrap;
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

	.inputlike {
        height: 15px;
        min-width: 20px;
		border: 1px solid transparent;
		background: transparent;
		border-radius: 8px;
        field-sizing: content;
		outline: none;
		background: var(--background-secondary);
        text-overflow: ellipsis;
        color: var(--text-color);
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

    .row {
        display: flex;
        gap: 2px;
    }
    
    .plus-button {
        display: flex;
        flex-direction: column;
        align-content: center;
        width: 100%;
    }
</style>
