<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { DiceRollersManager } from '../dice-roller/DiceRollersManager';
	import type { FullArtifact } from 'src/domain/models/artifact/FullArtifact';

    interface Props {
        currentItem: FullArtifact,
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