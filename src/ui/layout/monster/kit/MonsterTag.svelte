<script lang="ts">
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';
	import IconButton from '../../uikit/IconButton.svelte';
	import { X } from 'lucide-svelte';

    let { 
		name,
        description,
        isInEditMode,
		uiEventListener,
        onDelete = () => {}
	} = $props<{
        name: string;
        description: string;
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
        onDelete: () => void;
    }>();
</script>
  
<details class="generic-block">
    {#if isInEditMode && name !== "Описание"}
        <summary class="block-header">
            <div class="row">
                <input class="inputlike"
                    class:editable={isInEditMode}
                    bind:value={name}
                    readonly={!isInEditMode} 
                    />
                {#if isInEditMode}<IconButton icon={X} size={12} hint="Удалить {name}" onClick={onDelete}/>{/if}
            </div>
        </summary>
    {:else}
        <summary class="block-header">{name}</summary>
    {/if}
    <div class="generic-description">
        {#if isInEditMode}
            <textarea class="textarealike editable" bind:value={description} rows="3"></textarea> 
        {:else}
            <HtmlBlock htmlContent={description} uiEventListener={uiEventListener} />
        {/if}
    </div>
</details>

<style>
    .block-header {
        border-bottom: 1px solid;
        border-bottom-color: var(--text-color);
        color: var(--text-color);
        font-size: 16px;
        margin: 0.5em 0 0.5em;
        padding: 0 0 8px;
    }

    .generic-block {
        padding: 0.5em;
        color: var(--text-color);
        margin: 0.5em;
        background: var(--accent-bg);
        border-radius: 8px;
        cursor: pointer;
    }

    .generic-description {
        margin: 0.5em 0 0.125em;
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
</style>
