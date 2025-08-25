<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullBackground } from 'src/domain/models/background/FullBackground';
	import { copyBackgroundToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import HeaderFullUi from '../uikit/HeaderFullUi.svelte';

    interface Props {
        currentItem: FullBackground,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    const diceRollersManager = new DiceRollersManager(uiEventListener.onDiceRoll);

    onMount(async () => {
        diceRollersManager.onMount();
    });

    onDestroy(() => {
        diceRollersManager.onDestroy();
    });
</script>

<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        source={currentItem.source}
        onClick={() => copyBackgroundToClipboard(currentItem)}
    />

    <div class="background-details__content">
        <HtmlBlock htmlContent={currentItem.associatedHtml} uiEventListener={uiEventListener} />      
    </div>
</div>