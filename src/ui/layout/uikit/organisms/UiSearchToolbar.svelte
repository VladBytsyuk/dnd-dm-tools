<script lang="ts">
	import { ArrowLeft, Eraser, Plus, SlidersHorizontal } from "lucide-svelte";
	import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "../../../debouncer";
	import { onDestroy } from "svelte";

	interface Props {
		onbackclick?: () => void;
		onvaluechange?: (value: string) => void;
		isvaluechangable?: () => boolean;
		onclearclick?: () => void;
		onfiltersclick?: () => void;
		isfiltersapplied?: () => boolean;
		onaddclick?: () => void;
	}

	let { onbackclick, onvaluechange, isvaluechangable, onclearclick, onfiltersclick, isfiltersapplied, onaddclick }: Props = $props();

	let searchValue = $state("");

	let debouncer = new Debouncer(DEFAULT_DEBOUNCER_DELAY, async (value: string) => {
		onvaluechange?.(value);
	});

	onDestroy(() => debouncer.cancel());

	function onClearClick() {
		searchValue = "";
		onvaluechange?.("");
		onclearclick?.();
	}
</script>

<div class="search-toolbar">
	{#if onbackclick}<button onclick={onbackclick}><ArrowLeft /></button>{/if}
	<input
		bind:value={searchValue}
		oninput={() => debouncer.debounce(searchValue)}
		disabled={isvaluechangable && !isvaluechangable()}
	/>
	<button onclick={onClearClick} disabled={isvaluechangable && !isvaluechangable()}><Eraser /></button>
	{#if onfiltersclick}
		<div class="search-toolbar__action">
			<button onclick={onfiltersclick}><SlidersHorizontal /></button>
			{#if isfiltersapplied && isfiltersapplied()}
				<span class="search-toolbar__indicator"></span>
			{/if}
		</div>
	{/if}
	{#if onaddclick}
		<div class="search-toolbar__action">
			<button onclick={onaddclick}><Plus /></button>
		</div>
	{/if}
</div>

<style>
	.search-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.25em;
		width: 100%;
	}

	.search-toolbar input {
		border: none;
		flex: 1;
		padding: 0.5rem;
		border-radius: 0.5em;
		width: 100%;
		height: 3em;
	}

	.search-toolbar button {
		border-radius: 0.5em;
		align-items: center;
		cursor: pointer;
		width: 3em;
		height: 3em;
	}

	.search-toolbar__action {
		position: relative;
		display: inline-block;
	}

	.search-toolbar__indicator {
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
