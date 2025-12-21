<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { copyMonsterToClipboard, copyTextToClipboard } from "src/data/clipboard";
	import { DiceRollersManager } from '../../dice-roller/DiceRollersManager';
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';
	import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';

    let { 
		currentItem, 
		uiEventListener,
	} = $props<{
        currentItem: FullMonster;
        uiEventListener: IUiEventListener;
    }>();
    
    const diceRollersManager = DiceRollersManager.create(uiEventListener);
    
    onMount(async () => diceRollersManager.onMount());
    onDestroy(() => diceRollersManager.onDestroy());
</script>

<div class="header-root">
    <div
        class="header-name"
        role="button"
        tabindex="0"
        onclick={() => copyMonsterToClipboard(currentItem)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyMonsterToClipboard(currentItem); } }}
        aria-label="Скопировать статблок в буфер обмена"
    >
        {currentItem.name.rus} 📋
    </div>
        <div class="header-subtext">{currentItem.name.eng}</div>
        <div 
            class="header-subtext" 
            role="button"
            tabindex="0"
            onclick={() => copyTextToClipboard(currentItem.url)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { copyTextToClipboard(currentItem.url); } }}
            aria-label="Скопировать ссылку в буфер обмена"
        >
            {currentItem.url} 📋
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

    .header-subtext {
        font-family: "Open Sans", sans-serif;
        color: var(--text-color);
        opacity: 0.75;
        font-size: 12px;
        margin: 0 0 2px;
    }
</style>
