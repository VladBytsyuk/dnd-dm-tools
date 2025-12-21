<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { copyMonsterToClipboard, copyTextToClipboard } from "src/data/clipboard";
	import { DiceRollersManager } from '../../dice-roller/DiceRollersManager';
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';

    let { 
		currentItem,
        isInEditMode,
		uiEventListener,
	} = $props<{
        currentItem: FullMonster;
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
    }>();
    
    const diceRollersManager = DiceRollersManager.create(uiEventListener);
    
    onMount(async () => diceRollersManager.onMount());
    onDestroy(() => diceRollersManager.onDestroy());
</script>

<div class="header-root">
    <div class="header-line">
        <input class="header-name inputlike"
            class:inputlike-editable={isInEditMode}
            bind:value={currentItem.name.rus} 
            readonly={!isInEditMode} />
        <div
            class="header-name"
            role="button"
            tabindex="0"
            onclick={() => copyMonsterToClipboard(currentItem)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyMonsterToClipboard(currentItem); } }}
            aria-label="Скопировать статблок в буфер обмена"
        >📋</div>
    </div>
    <div class="header-line">
        <input class="header-subtext inputlike"
            class:inputlike-editable={isInEditMode}
            bind:value={currentItem.name.eng} 
            readonly={!isInEditMode} />
    </div>
    <div class="header-line">
        <input class="header-subtext inputlike"
            class:inputlike-editable={isInEditMode}
            bind:value={currentItem.url} 
            readonly={!isInEditMode} />
        <div 
            class="header-subtext" 
            role="button"
            tabindex="0"
            onclick={() => copyTextToClipboard(currentItem.url)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyTextToClipboard(currentItem.url); } }}
            aria-label="Скопировать ссылку в буфер обмена"
        >📋</div>
    </div>
</div>

<style>
    .header-root {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .header-name {
        font-family: "Open Sans", sans-serif;
        color: var(--text-color);
        font-size: 21px;
        line-height: 1.2em;
        margin: 0 0 2px;
        letter-spacing: 1px;
    }

    .header-line {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        width: 100%;  
    }

    .header-subtext {
        font-family: "Open Sans", sans-serif;
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12px;
        margin: 0 0 2px;
    }

	.inputlike {
        flex: 1 1 auto;
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
	}

	.inputlike-editable {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}

    .header-line > div[role="button"] {
        flex: 0 0 auto;
        cursor: pointer;
    }
</style>
