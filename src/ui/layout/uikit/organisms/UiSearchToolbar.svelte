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
		debouncer.cancel();
		searchValue = "";
		onvaluechange?.("");
		onclearclick?.();
	}
</script>

<div class="search-toolbar">
	{#if onbackclick}<button type="button" onclick={onbackclick}><ArrowLeft /></button>{/if}
	<input
		bind:value={searchValue}
		oninput={() => debouncer.debounce(searchValue)}
		disabled={isvaluechangable && !isvaluechangable()}
	/>
	<button type="button" onclick={onClearClick} disabled={isvaluechangable && !isvaluechangable()}><Eraser /></button>
	{#if onfiltersclick}
		<div class="search-toolbar__action">
			<button type="button" onclick={onfiltersclick}><SlidersHorizontal /></button>
			{#if isfiltersapplied && isfiltersapplied()}
				<span class="search-toolbar__indicator"></span>
			{/if}
		</div>
	{/if}
	{#if onaddclick}
		<div class="search-toolbar__action">
			<button type="button" onclick={onaddclick}><Plus /></button>
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
		position: relative;
		z-index: 2;
		flex-shrink: 0;
	}

	.search-toolbar input {
		border: 1px solid var(--dnd-ui-border-subtle);
		flex: 1;
		padding: 0.5rem;
		border-radius: var(--dnd-ui-radius-lg);
		width: 100%;
		height: 3em;
		background-color: var(--dnd-ui-surface-muted-strong);
		color: var(--dnd-ui-text-primary);
	}

	.search-toolbar button {
		border-radius: var(--dnd-ui-radius-lg);
		align-items: center;
		cursor: pointer;
		width: 3em;
		height: 3em;
		background-color: var(--dnd-ui-surface-panel);
		border: 1px solid var(--dnd-ui-border-subtle);
		color: var(--dnd-ui-text-secondary);
	}

	.search-toolbar__action {
		position: relative;
		display: inline-block;
	}

	.search-toolbar__indicator {
		position: absolute;
		top: var(--dnd-ui-space-4);
		right: var(--dnd-ui-space-4);
		width: var(--dnd-ui-space-8);
		height: var(--dnd-ui-space-8);
		background: var(--dnd-ui-pattern-toolbar-indicator);
		border-radius: var(--dnd-ui-radius-round);
		z-index: 2;
		pointer-events: none;
		box-shadow: var(--dnd-ui-pattern-toolbar-indicator-shadow);
	}
</style>
