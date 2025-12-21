<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullMonster } from '../../../domain/models/monster/FullMonster';
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

    let { 
		currentItem, 
		uiEventListener
	} = $props<{
        currentItem: FullMonster;
        uiEventListener: IUiEventListener;
    }>();

	let isInEditMode = $state(false);
    var reservedItem = structuredClone(currentItem);
    
    const diceRollersManager = DiceRollersManager.create(uiEventListener);
    onMount(async () => diceRollersManager.onMount());
    onDestroy(() => diceRollersManager.onDestroy());

    const notEmpty = (list: any[] | undefined): boolean => {
        return list !== undefined && list.length > 0;
    }

    const onEditModeChange = (newIsInEditMode: boolean, saveChanges: boolean) => {
        isInEditMode = newIsInEditMode;
        if (newIsInEditMode)  {
            reservedItem = structuredClone(currentItem);
        } else {
            if (saveChanges) {
                console.log(`Changes should be saved.`);
            } else {
                currentItem = structuredClone(reservedItem);
            }
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
                        <MonsterEditPanel {isInEditMode} {onEditModeChange} />
                        <MonsterSource {currentItem} {isInEditMode} />
                    </div>
                </div>
            </div>

        </div>

		<div class="info-section">
			<div>
				{#if currentItem.ability}<MonsterScoresTable {currentItem} />{/if}
				<MonsterBaseInfo {currentItem} {uiEventListener} />
			</div>

			{#if currentItem.images?.length}
                <MonsterImage {currentItem} {uiEventListener} />
			{/if}
		</div>

        <!-- Abilities Block -->
        {#if notEmpty(currentItem.feats)}
            <MonsterAbilities items={currentItem.feats} {uiEventListener}/>
        {/if}

        <!-- Action Blocks -->
        {#if notEmpty(currentItem.actions)}
            <MonsterAbilities title="Действия" items={currentItem.actions} {uiEventListener}/>
        {/if}

        {#if notEmpty(currentItem.bonusActions)}
            <MonsterAbilities title="Бонусные действия" items={currentItem.bonusActions} {uiEventListener}/>
        {/if}

        {#if notEmpty(currentItem.reactions)}
            <MonsterAbilities title="Реакции" items={currentItem.reactions} {uiEventListener}/>
        {/if}


        {#if currentItem.legendary && notEmpty(currentItem.legendary.list)}
            <MonsterAbilities 
                title="Легендарные действия"
                description={currentItem.legendary.description}
                items={currentItem.legendary.list}
                {uiEventListener}
            />
        {/if}

        {#if currentItem.lair}
            <MonsterLair lair={currentItem.lair} {uiEventListener} />
        {/if}

        <!-- Description -->
        {#if currentItem.description}
            <MonsterTag name="Описание" description={currentItem.description} {uiEventListener} />
        {/if}

        <!-- Tags -->
        {#each currentItem.tags as tag}
            <MonsterTag name={tag.name} description={tag.description} {uiEventListener} />
        {/each}
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

    .section-horizontal {
        display: flex;
    }

    .section-horizontal-header {
        flex: 1;
    }

</style>
