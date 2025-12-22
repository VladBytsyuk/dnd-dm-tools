<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.ts';

    let { currentItem, isInEditMode, uiEventListener } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
        uiEventListener: IUiEventListener
    }>();
</script>

<div class="item">
    <div class="icon">
        <Heart size="12" />
    </div>

    <input class="value inputlike bold"
        class:inputlike-editable={isInEditMode}
        bind:value={currentItem.hits.average} 
        readonly={!isInEditMode} />

    {#if isInEditMode}
        &nbsp;(
        <input class="value inputlike inputlike-editable" bind:value={currentItem.hits.formula} />
        <input class="value inputlike inputlike-editable" bind:value={currentItem.hits.sign}  />
        <input class="value inputlike inputlike-editable" bind:value={currentItem.hits.bonus}  />
        )
    {:else if currentItem.hits.formula || currentItem.hits.bonus}
        &nbsp;(
        <dice-roller 
            label="Хиты" 
            formula="{currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}"
        >
            {currentItem.hits.formula}{currentItem.hits.sign}{currentItem.hits.bonus}
        </dice-roller>)
    {/if}
</div>

<style>
    .item {
        display: inline-flex;
        align-items: center;
        gap: 0px;
        flex: 0 0 auto;
        min-width: 0;
        background: transparent;
        margin-left: 0 !important;
        padding-left: 0 !important;
    }

    .icon {
        display: block;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }

    .value {
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
	    text-overflow: ellipsis;
        line-height: 1;
        display: inline-flex;
        align-items: center;
    }

	.inputlike {
        flex: 1 1 auto;
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
        text-align: center;
        field-sizing: content;
        max-width: 160px;
	}

    .bold {
        font-weight: 800;
    }

	.inputlike-editable {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}
</style>
