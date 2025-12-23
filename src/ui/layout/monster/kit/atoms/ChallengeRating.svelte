<script lang="ts">
	import { Plus, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';
	import { EmptySense, EmptySenses } from 'src/domain/models/common/Senses';

    let { currentItem, isInEditMode } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
    }>();
</script>

<div class="item">
    <div class="title">Опасность</div>

    <input class="value inputlike" 
        class:editable={isInEditMode}
        bind:value={currentItem.challengeRating} 
        readonly={!isInEditMode} 
        />
    <span class="value">&nbsp; (</span>
    <input class="value inputlike" 
        class:editable={isInEditMode}
        bind:value={currentItem.experience} 
        readonly={!isInEditMode} 
        />
    <span class="value">&nbsp;XP)</span>
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
