<script lang="ts">
    import { onDestroy, onMount, tick } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import { type FullMonster } from '../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
	import MonsterBaseInfo from './kit/MonsterBaseInfo.svelte';
	import MonsterName from './kit/MonsterName.svelte';
	import MonsterSource from './kit/MonsterSource.svelte';
	import MonsterScoresTable from './kit/MonsterScoresTable.svelte';
	import MonsterImage from './kit/MonsterImage.svelte';
	import MonsterAbilities from './kit/MonsterAbilities.svelte';
	import MonsterLair from './kit/MonsterLair.svelte';
	import MonsterTag from './kit/MonsterTag.svelte';
	import MonsterEditPanel from './kit/MonsterEditPanel.svelte';
	import IconButton from '../uikit/IconButton.svelte';
	import { Plus } from 'lucide-svelte';
	import { EmptyTag } from '../../../domain/models/common/Tag';
	import { Notice } from 'obsidian';

    let { 
		currentItem, 
		uiEventListener,
        isEditable = false,
        onClose = () => {},
        onItemSave = (currentItem: FullMonster) => {true},
        onItemDelete = (url: string) => {true}
	} = $props<{
        currentItem: FullMonster;
        uiEventListener: IUiEventListener;
        isEditable: boolean;
        onCloose: () => void;
        onItemSave: (currentItem: FullMonster) => boolean;
        onItemDelete: (url: string) => boolean;
    }>();

	let isInEditMode = $state(false);
    var reservedItem = $state.snapshot(currentItem);
    
    const diceRollersManager = DiceRollersManager.create(uiEventListener);
    onMount(async () => diceRollersManager.onMount());
    onDestroy(() => diceRollersManager.onDestroy());

    const notEmpty = (list: any[] | undefined): boolean => {
        return list !== undefined && list.length > 0;
    }

    const onEditModeChange = async (newIsInEditMode: boolean, saveChanges: boolean) => {
        if (newIsInEditMode) {
            isInEditMode = newIsInEditMode;
            reservedItem = $state.snapshot(currentItem);
            return;
        }

        if (saveChanges) {
            if (validateUrl(currentItem.url)) {
                const saveSucceed = onItemSave(currentItem);
                if (saveSucceed) {
                    isInEditMode = newIsInEditMode;
                } else {
                    new Notice(`Ошибка сохранения`);
                }
            } else {
                new Notice(`URL (${currentItem.url}) должен быть непустым и начинаться с /bestiary/`);
            }
        } else {
            isInEditMode = newIsInEditMode;
            currentItem = structuredClone(reservedItem);
        }

        await tick();
        diceRollersManager.onMount();
    }

    const validateUrl = (url: string): boolean => url.length > 10 && url.startsWith('/bestiary/');

    const onMonsterDelete = () => {
        const deleteSuccess = onItemDelete(currentItem.url);
        if (deleteSuccess) {
            onClose();
        } else {
            new Notice(`Ошибка удаления`);
        }
    }
</script>
  
{#if currentItem}
<div class="monster-root">
    <div class="statblock">
        <div class="section-horizontal">
            <div class="section-horizontal-header">
                <div class="header">
                    <div class="header-left">
                        <MonsterName {currentItem} {isInEditMode} {uiEventListener} />
                    </div>

                    <div class="header-right">
                        {#if isEditable}<MonsterEditPanel {isInEditMode} {onEditModeChange} onItemDelete={onMonsterDelete}/>{/if}
                        <MonsterSource {currentItem} {isInEditMode} />
                    </div>
                </div>
            </div>

        </div>

		<div class="info-section">
			<div class="info-left">
				{#if currentItem.ability}<MonsterScoresTable {currentItem} {isInEditMode} />{/if}
				<MonsterBaseInfo {currentItem} {isInEditMode} {uiEventListener} />
			</div>

			{#if currentItem.images?.length}
                <MonsterImage {currentItem} {isInEditMode} {uiEventListener} />
			{/if}
		</div>

        <!-- Abilities Block -->
        {#if isInEditMode || notEmpty(currentItem.feats)}
            <MonsterAbilities items={currentItem.feats} {isInEditMode} {uiEventListener} onItemsChange={it => currentItem.feats = it} />
        {/if}

        <!-- Action Blocks -->
        {#if isInEditMode || notEmpty(currentItem.actions)}
            <MonsterAbilities title="Действия" items={currentItem.actions} {isInEditMode} {uiEventListener} onItemsChange={it => currentItem.actions = it} />
        {/if}

        {#if isInEditMode || notEmpty(currentItem.bonusActions)}
            <MonsterAbilities title="Бонусные действия" items={currentItem.bonusActions} {isInEditMode} {uiEventListener} onItemsChange={it => currentItem.bonusActions = it} />
        {/if}

        {#if isInEditMode || notEmpty(currentItem.reactions)}
            <MonsterAbilities title="Реакции" items={currentItem.reactions} {isInEditMode} {uiEventListener} onItemsChange={it => currentItem.reactions = it} />
        {/if}


        {#if isInEditMode || currentItem.legendary && notEmpty(currentItem.legendary.list)}
            <MonsterAbilities 
                title="Легендарные действия"
                description={currentItem.legendary.description}
                items={currentItem.legendary.list} 
                {isInEditMode}
                {uiEventListener} 
                onItemsChange={it => currentItem.legendary.list = it} 
            />
        {/if}

        {#if isInEditMode || currentItem.lair}
            <MonsterLair lair={currentItem.lair} {isInEditMode} {uiEventListener} />
        {/if}

        <!-- Description -->
        {#if isInEditMode || currentItem.description}
            <MonsterTag name="Описание" description={currentItem.description} {isInEditMode} {uiEventListener} onDelete={() => { currentItem.description = undefined }} />
        {/if}

        <!-- Tags -->
        {#each currentItem.tags as tag, index}
            <MonsterTag name={tag.name} description={tag.description} {isInEditMode} {uiEventListener} onDelete={() => currentItem.tags.splice(index, 1)} />
        {/each}
        {#if isInEditMode}
            <div class="plus-button">
                <IconButton icon={Plus} size={16} hint="Добавить тэг" onClick={() => currentItem.tags ? currentItem.tags.push(EmptyTag()) : currentItem.tags = [EmptyTag()]}/>
            </div>
        {/if}
    </div>
</div>
{/if}

<style>
    :global(.theme-light) {
        --accent-bg: #00000014;
        --accent-bg-sub: #00000007;
        --button-bg: rgba(0,0,0,0.1);
    }

    :global(.theme-dark) {
        --accent-bg: #ffffff0d;
        --accent-bg-sub: #ffffff06;
        --button-bg: rgba(255,255,255,0.1);
    }

    .monster-root {
        display: inline-block;
        position: relative;
        overflow: visible;
        background: #00000020;
        border-radius: 8px;
        border-color: #00000090;
        border-width: 2px;
        color: var(--text-color);
    }

    .statblock {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: inline-block;
        vertical-align: top;
        width: 100%;
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: "Open Sans", sans-serif;
        background: var(--bg-color);
        color: var(--text-color);
    }

    .header {
        margin: 0 0 0.5em;
		display: flex;
		align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .header-left {
        min-width: 0; 
        flex: 1 1 auto;
        flex-grow: 1;
    }

    .header-left :global(*) {
        min-width: 0;
    }

    .header-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex: 0 0 auto;
    }

	.info-section {
        display: flex;
		justify-content: space-between;
    }

    .info-left {
        width: 70%;
    }

    .section-horizontal {
        display: flex;
    }

    .section-horizontal-header {
        flex: 1;
    }

    .plus-button {
        display: flex;
        flex-direction: column;
        align-content: center;
        width: 100%;
    }
</style>
