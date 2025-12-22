<script lang="ts">
	import { Plus, Shield, X } from 'lucide-svelte';
	import type { FullMonster } from 'src/domain/models/monster/FullMonster.ts';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.ts';
	import { EmptyArmor, type Armor } from 'src/domain/models/common/Armor';
	import IconButton from 'src/ui/layout/uikit/IconButton.svelte';
	import HtmlBlock from 'src/ui/layout/uikit/HtmlBlock.svelte';

    let { currentItem, isInEditMode, uiEventListener } = $props<{ 
        currentItem: FullMonster, 
        isInEditMode: boolean,
        uiEventListener: IUiEventListener
    }>();

    const addArmor = () => currentItem.armors.push(EmptyArmor());
    const removeArmor = (index: number) => currentItem.armors.splice(index, 1);
    const armorHtml = (armor: Armor) => armor.url
        ? `<a href="${armor.url}">${armor.name}</a>`
        : armor.name;
</script>

<div class="item">
    <div class="icon">
        <Shield size="12" />
    </div>

    <input class="value inputlike bold"
        class:inputlike-editable={isInEditMode}
        bind:value={currentItem.armorClass} 
        readonly={!isInEditMode} />

    {#if isInEditMode}
        {#each currentItem.armors as armor, index}
            {#if index === 0}({/if}
            <div class="armor-column">
                <input class="value inputlike inputlike-editable" bind:value={armor.name} />
                <input class="value inputlike inputlike-editable" bind:value={armor.url} />
            </div>
            <IconButton icon={X} hint={"Удалить " + armor.name} size={8} onClick={() => removeArmor(index)} />
            {#if index !== (currentItem.armors.length - 1)},&nbsp;{:else}){/if}
        {/each}
        <IconButton icon={Plus} hint="Добавить броню" size={12} onClick={() => addArmor()} />
    {:else}
        {#each currentItem.armors as armor, index}
            {#if index === 0}({/if}
            <HtmlBlock htmlContent={armorHtml(armor)} {uiEventListener}/>
            {#if index !== (currentItem.armors.length - 1)},&nbsp;{:else}){/if}
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
