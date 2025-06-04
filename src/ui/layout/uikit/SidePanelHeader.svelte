<script lang="ts">
	import { ArrowLeft, Eraser, SlidersHorizontal } from "lucide-svelte";
	import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "../../debouncer";
	import { onDestroy } from "svelte";

    // ---- Props ----
    let { onbackclick, onvaluechange, onclearclick, onfiltersclick } = $props();

    // ---- State ----
    let searchValue = $state('');

    // ---- Local objects ----
    let debouncer = new Debouncer(
        DEFAULT_DEBOUNCER_DELAY,
        async (value: string) => {
            if (onvaluechange) {
                onvaluechange(value);
            }
        }
    )

    // ---- Event Handlers ----     
    onDestroy(() => debouncer.cancel());

    function onClearClick() {
        searchValue = '';
        onvaluechange?.('');
        if (onclearclick) {
            onclearclick();
        }
    }   
</script>

<div class="header">
    {#if onbackclick}<button onclick={onbackclick}><ArrowLeft /></button>{/if}
    <input bind:value={searchValue} oninput={() => debouncer.debounce(searchValue)}/>
    <button onclick={onClearClick}><Eraser /></button>
    {#if onfiltersclick}<button onclick={onfiltersclick}><SlidersHorizontal /></button>{/if}
</div>

<style>
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.25em;
        width: 100%;
    }

    .header input {
        border: none;
        flex: 1;
        padding: 0.5rem;
        border-radius: 0.5em;
        width: 100%;
        height: 3em;
    }

    .header button {
        border-radius: 0.5em;
        align-items: center;
        cursor: pointer;
        width: 3em;
        height: 3em;
    }
</style>
