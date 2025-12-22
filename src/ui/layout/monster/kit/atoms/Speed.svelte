<script lang="ts">
	import { Plus, Footprints, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import { EmptySpeed } from 'src/domain/models/common/Speed';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';

    let { currentItem, isInEditMode } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
    }>();

    const addSpeed = () => currentItem.speed.push(EmptySpeed());
    const removeSpeed = (index: number) => currentItem.speed.splice(index, 1);
</script>

<div class="item">
    <div class="icon">
        <Footprints size="12" />
    </div>

    {#if isInEditMode}
        {#each currentItem.speed as speed, index}
            <div class="armor-column">
                <input class="value inputlike inputlike-editable" bind:value={speed.name} />
                <input class="value inputlike inputlike-editable" bind:value={speed.value} />
                <input class="value inputlike inputlike-editable" bind:value={speed.additional} />
            </div>
            <IconButton icon={X} hint={"Удалить " + speed.name} size={8} onClick={() => removeSpeed(index)} />
            {#if index !== (currentItem.speed.length - 1)},&nbsp;{/if}
        {/each}
        <IconButton icon={Plus} hint="Добавить тип передвижения" size={12} onClick={() => addSpeed()} />
    {:else}
        {#each currentItem.speed as speed, index}
            {#if speed.name}{speed.name} {/if}
            {#if index === 0}<span class="value bold">{speed.value} фт.</span>{:else}{speed.value} фт.{/if}
            {#if speed.additional} ({speed.additional}){/if}
            {#if index !== (currentItem.speed.length - 1)},&nbsp;{/if}
        {/each}
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

    .armor-column {
        display: flex;
        flex-direction: column;
    }
</style>
