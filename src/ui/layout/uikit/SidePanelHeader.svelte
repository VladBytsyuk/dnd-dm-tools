<script lang="ts">
	import { ArrowLeft, Eraser, SlidersHorizontal } from "lucide-svelte";
	import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "../../debouncer";
	import { onDestroy } from "svelte";

    // ---- Props ----
    let { onbackclick, onvaluechange, isvaluechangable, onclearclick, onfiltersclick, isfiltersapplied } = $props();

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
    <input 
        bind:value={searchValue}
        oninput={() => debouncer.debounce(searchValue)}
        disabled={isvaluechangable && !isvaluechangable()}
    />
    <button onclick={onClearClick} disabled={isvaluechangable && !isvaluechangable()}><Eraser /></button>
    {#if onfiltersclick}
        <div class="filters-btn-wrapper">
            <button onclick={onfiltersclick}><SlidersHorizontal /></button>
            {#if isfiltersapplied && isfiltersapplied()}
                <span class="filters-indicator"></span>
            {/if}
        </div>
    {/if}
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

    .filters-btn-wrapper {
        position: relative;
        display: inline-block;
    }

    .filters-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        background: var(--interactive-accent);
        border-radius: 50%;
        z-index: 2;
        pointer-events: none;
        box-shadow: 0 0 2px #888;
    }
</style>
