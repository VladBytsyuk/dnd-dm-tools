<script lang="ts">
	import { Plus, Footprints, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';
	import { EmptySense, EmptySenses } from 'src/domain/models/common/Senses';

    let { currentItem, isInEditMode } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
    }>();

    const addSense = () => {
        if (!currentItem.senses) {
            currentItem.senses = EmptySenses()
        }

        currentItem.senses.senses 
            ? currentItem.senses.senses.push(EmptySense()) 
            : currentItem.senses.senses = [EmptySense()];
    }
    const removeSense = (index: number) => currentItem.senses.senses.splice(index, 1);
</script>

<div class="item">
    <div class="title">Чувства</div>

    {#each currentItem.senses.senses as sense, index}
        <input class="value inputlike editable" 
            class:editable={isInEditMode}
            bind:value={sense.name} 
            readonly={!isInEditMode} 
            />
        <input class="value inputlike editable" 
            class:editable={isInEditMode}
            bind:value={sense.value} 
            readonly={!isInEditMode} 
            />
        <span class="value inputlike">&nbsp;фт.,&nbsp;</span>
        {#if isInEditMode}<IconButton icon={X} hint={"Удалить " + sense.name} size={8} onClick={() => removeSense(index)} />{/if}
        {#if index !== (currentItem.speed.length - 1)},&nbsp;{/if}
    {/each}
    {#if isInEditMode}<IconButton icon={Plus} hint="Добавить чувство" size={12} onClick={addSense} />{/if}

    <span class="value inputlike">пассивная внимательность&nbsp;</span>
    <input class="value inputlike"
        class:editable={isInEditMode}
        bind:value={currentItem.senses.passivePerception}
        readonly={!isInEditMode} 
        />
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

    .bold {
        font-weight: 800;
    }

	.editable {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}

    .column {
        display: flex;
        flex-direction: column;
    }
</style>
