<script lang="ts">
	import { Plus, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import { formatModifier } from 'src/domain/modifier';
	import { EmptySavingThrow } from 'src/domain/models/common/SavingThrow';
	import IconButton from '../../../uikit/IconButton.svelte';

    let { currentItem, isInEditMode } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
    }>();

    const addSavingThrow = () => currentItem.savingThrows.push(EmptySavingThrow());
    const removeSavingThrow = (index: number) => currentItem.savingThrows.splice(index, 1);
</script>

<div class="saving-throws">
    <span class="title">Спасброски</span>
    {#if isInEditMode}
        {#each currentItem.savingThrows as savingThrow, index}
            <input class="value inputlike" bind:value={savingThrow.name} />
            <input class="value inputlike" bind:value={savingThrow.value} />
            <IconButton icon={X} size={8} hint="Удалить {savingThrow.name}" onClick={() => removeSavingThrow(index)}/>
        {/each}
        <IconButton icon={Plus} size={12} hint="Добавить спасбросок" onClick={addSavingThrow}/>
    {:else}
        {#each currentItem.savingThrows as savingThrow, index}
            <dice-roller
                label="Спасбросок. {savingThrow.name}"
                formula="к20{formatModifier(savingThrow.value)}"
            >
                {savingThrow.name} {formatModifier(savingThrow.value)}
            </dice-roller>
            {#if index !== (currentItem.savingThrows.length - 1)},&nbsp;{/if}
        {/each}
    {/if}
</div>

<style>
    .saving-throws {
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
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
        text-align: center;
        field-sizing: content;
        max-width: 160px;
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}
</style>
