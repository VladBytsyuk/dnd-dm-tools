<script lang="ts">
	import { Plus, X } from 'lucide-svelte';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';

    let { title, items, isInEditMode, onItemsChange } = $props<{ 
        title: string,
        items?: string[],
        isInEditMode: boolean,
        onItemsChange: (items: string[]) => {}
    }>();

    const addItem = () => {
        items ? items.push("") : items = [""];
        onItemsChange(items);
    }
    const removeItem = (index: number) => {
        items.splice(index, 1);
        onItemsChange(items);
    }
</script>

<div class="list">
    <span class="title">{title}</span>
    {#each items as item, index}
        <input class="value inputlike"
            class:editable={isInEditMode}
            bind:value={items[index]}
            readonly={!isInEditMode} 
            />
        {#if isInEditMode}<IconButton icon={X} size={8} hint="Удалить {item}" onClick={() => removeItem(index)}/>{/if}
    {/each}
    {#if isInEditMode}<IconButton icon={Plus} size={12} hint="Добавить" onClick={addItem}/>{/if}
</div>

<style>
    .list {
        display: flex;
        flex-wrap: wrap;
        align-content: start;
        align-items: baseline;
        color: var(--text-color);
        gap: 0px;
    }

    .title {
        color: var(--text-color);
        font-size: 12.5px;
        line-height: 1.2em;
        font-weight: bold;
        margin-right: 4px;
    }

    .value {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12.5px;
        line-height: 1.2em;
    }

	.inputlike {
        flex: 1 1 auto;
        height: 15px;
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
        text-align: center;
        field-sizing: content;
        max-width: 160px;
	}

    .editable {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
    }
</style>
