<script lang="ts">
	import { Check, ChevronLeft, ClipboardPaste, Copy, Eraser, Pencil, Plus, SlidersHorizontal, Trash2, X } from "lucide-svelte";
	import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "../../../debouncer";
	import { onDestroy } from "svelte";
	import { SearchBar, type SearchBarAction } from "@dnd-dm-tools/design-system";
	import { theme as appTheme, Theme } from "src/ui/theme";

	interface Props {
		onbackclick?: () => void;
		onvaluechange?: (value: string) => void;
		isvaluechangable?: () => boolean;
		onclearclick?: () => void;
		onfiltersclick?: () => void;
		isfiltersapplied?: () => boolean;
		onaddclick?: () => void;
		oneditclick?: () => void;
		oncopyclick?: () => void;
		onpasteclick?: () => void;
		ondeleteclick?: () => void;
		onsaveclick?: () => void;
		oncancelclick?: () => void;
		actionBusy?: boolean;
		redesignEnabled?: boolean;
	}

	let { onbackclick, onvaluechange, isvaluechangable, onclearclick, onfiltersclick, isfiltersapplied, onaddclick, oneditclick, oncopyclick, onpasteclick, ondeleteclick, onsaveclick, oncancelclick, actionBusy = false, redesignEnabled = false }: Props = $props();

	let searchValue = $state("");
	const dsTheme = $derived($appTheme === Theme.Dark ? "dark" : "light");
	const searchActions = $derived.by<SearchBarAction[]>(() => {
		const result: SearchBarAction[] = oncopyclick ? [{ icon: Copy, label: "Копировать в буфер обмена", onclick: oncopyclick }] : [];
		if (onpasteclick) result.push({ icon: ClipboardPaste, label: "Вставить", text: "Вставить", disabled: actionBusy, onclick: onpasteclick });
		if (ondeleteclick) result.push({ icon: Trash2, label: "Удалить", onclick: ondeleteclick });
		if (onsaveclick && oncancelclick) return [...result,
			{ icon: X, label: "Отмена", disabled: actionBusy, onclick: oncancelclick },
			{ icon: Check, label: "Сохранить", disabled: actionBusy, onclick: onsaveclick },
		];
		if (oneditclick) return [...result, { icon: Pencil, label: "Редактировать", onclick: oneditclick }];
		if (!oncopyclick) result.push({ icon: Eraser, label: "Очистить поиск", disabled: Boolean(isvaluechangable && !isvaluechangable()), onclick: onClearClick });
		if (onfiltersclick) result.push({ icon: SlidersHorizontal, label: "Фильтры", onclick: onfiltersclick });
		if (onaddclick) result.push({ icon: Plus, label: "Добавить", onclick: onaddclick });
		return result;
	});

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

{#if redesignEnabled}
	<SearchBar
		bind:value={searchValue}
		placeholder="Поиск в справочнике"
		aria-label="Поиск в справочнике"
		disabled={isvaluechangable && !isvaluechangable()}
		oninput={() => debouncer.debounce(searchValue)}
		leadingAction={onbackclick ? { icon: ChevronLeft, label: "Назад", onclick: onbackclick } : undefined}
		actions={searchActions}
		theme={dsTheme}
	/>
{:else}<div class="search-toolbar">
	{#if onbackclick}<button type="button" onclick={onbackclick}><ChevronLeft /></button>{/if}
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
</div>{/if}

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
