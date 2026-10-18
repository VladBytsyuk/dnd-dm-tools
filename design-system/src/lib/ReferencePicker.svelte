<script lang="ts">
	import { tick, untrack } from "svelte";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import X from "lucide-svelte/icons/x";
	import "@fontsource/golos-text/400.css";

	export type ReferenceOption = { value: string; label: string };
	type Props = {
		label: string;
		options?: ReferenceOption[];
		value?: string | null;
		selectedLabel?: string;
		placeholder?: string;
		onChange?: (value: string | null) => void;
		align?: "start" | "end";
		open?: boolean;
		panelOnly?: boolean;
		onClose?: () => void;
		theme?: "dark" | "light";
	};
	let { label, options = [], value = $bindable<string | null>(null), selectedLabel, placeholder = "Выбрать", onChange, align = "start", open = $bindable(false), panelOnly = false, onClose, theme = "dark" }: Props = $props();
	const id = $props.id();
	let openAtEnd = false;
	let query = $state("");
	let activeIndex = $state(0);
	let root: HTMLDivElement;
	let trigger = $state<HTMLButtonElement>();
	let search = $state<HTMLInputElement>();
	let filtered = $derived(options.filter((option) => option.label.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"))));
	let currentLabel = $derived(selectedLabel ?? options.find((option) => option.value === value)?.label ?? value ?? placeholder);
	let active = $derived(filtered.length ? Math.max(0, Math.min(activeIndex, filtered.length - 1)) : -1);
	$effect(() => {
		if (!open) return;
		untrack(() => {
			query = "";
			const selected = options.findIndex((option) => option.value === value);
			activeIndex = selected >= 0 ? selected : openAtEnd ? Math.max(0, options.length - 1) : 0;
			openAtEnd = false;
		});
		void tick().then(() => { search?.focus(); scrollActive(); });
	});

	function show(last = false) {
		openAtEnd = last;
		open = true;
	}
	function close(restoreFocus = true) {
		open = false;
		query = "";
		if (restoreFocus) trigger?.focus();
		onClose?.();
	}
	function choose(next: string | null) {
		value = next;
		onChange?.(next);
		close();
	}
	function scrollActive() {
		root?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
	}
	async function handleKey(event: KeyboardEvent) {
		if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return; }
		if (event.key === "Enter") {
			event.preventDefault();
			if (active >= 0) choose(filtered[active].value);
			return;
		}
		if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		if (event.key === "Home") activeIndex = 0;
		else if (event.key === "End") activeIndex = Math.max(0, filtered.length - 1);
		else if (filtered.length) activeIndex = (active + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
		await tick();
		scrollActive();
	}
</script>

<svelte:window onpointerdown={(event) => { if (open && event.target instanceof Node && !root.contains(event.target)) close(); }} />

<div class="reference-picker" class:panel-only={panelOnly} data-theme={theme} data-align={align} bind:this={root} onfocusout={(event) => { if (open && event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) close(false); }}>
	{#if !panelOnly}
	<div class="picker-controls">
		<button class="picker-trigger" type="button" bind:this={trigger} aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} title={value ? currentLabel : undefined} onclick={() => open ? close() : show()} onkeydown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); void show(event.key === "ArrowUp"); } else if (event.key === "Escape" && open) close(); }}>
			<span>{value ? currentLabel : placeholder}</span><ChevronDown size={12} style="width: calc(12 * var(--ds-media-unit, 1px)); height: calc(12 * var(--ds-media-unit, 1px))" aria-hidden={true} />
		</button>
		{#if value !== null}<button class="clear" type="button" aria-label={`Убрать: ${label}`} title={`Убрать: ${label}`} onclick={() => choose(null)}><X size={12} style="width: calc(12 * var(--ds-media-unit, 1px)); height: calc(12 * var(--ds-media-unit, 1px))" aria-hidden={true} /></button>{/if}
	</div>
	{/if}
	{#if open}
		<div class="picker-panel">
			<input bind:this={search} role="combobox" aria-label={`Поиск: ${label}`} aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined} placeholder="Поиск…" value={query} oninput={(event) => { query = event.currentTarget.value; activeIndex = 0; }} onkeydown={handleKey} />
			<div class="options" role="listbox" id={`${id}-list`} aria-label={label}>
				{#each filtered as option, index (option.value)}
					<button class="option" class:highlighted={index === active} type="button" role="option" id={`${id}-option-${index}`} data-option-index={index} aria-selected={option.value === value} tabindex="-1" title={option.label} onpointermove={() => { activeIndex = index; }} onclick={() => choose(option.value)}>{option.label}</button>
				{/each}
			</div>
			{#if !filtered.length}<p class="empty" role="status">{options.length ? "Ничего не найдено" : "Нет доступных вариантов"}</p>{/if}
		</div>
	{/if}
</div>

<style>
	.reference-picker { position: relative; min-width: 0; max-width: 100%; color: #fff; font: calc(12 * var(--ds-media-unit, 1px))/calc(15 * var(--ds-media-unit, 1px)) "Golos Text", sans-serif; text-align: left; }
	.reference-picker[data-theme="light"] { color: #1f2937; }
	.picker-controls { display: flex; align-items: center; gap: calc(2 * var(--ds-media-unit, 1px)); min-width: 0; }
	.reference-picker button { all: unset; box-sizing: border-box; cursor: pointer; border-radius: calc(4 * var(--ds-media-unit, 1px)); }
	.reference-picker .picker-trigger { display: flex; flex: 1; align-items: center; justify-content: space-between; gap: calc(4 * var(--ds-media-unit, 1px)); min-width: 0; padding: calc(3 * var(--ds-media-unit, 1px)) calc(4 * var(--ds-media-unit, 1px)); background: rgb(212 212 212 / 20%); }
	.picker-trigger span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.picker-trigger :global(svg) { flex: 0 0 auto; }
	.reference-picker .clear { display: grid; flex: 0 0 calc(20 * var(--ds-media-unit, 1px)); width: calc(20 * var(--ds-media-unit, 1px)); height: calc(20 * var(--ds-media-unit, 1px)); place-items: center; }
	.reference-picker button:hover { background: rgb(212 212 212 / 25%); }
	.reference-picker button:focus-visible, .reference-picker input:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(1 * var(--ds-media-unit, 1px)); }
	.picker-panel { position: absolute; left: 0; top: calc(100% + calc(4 * var(--ds-media-unit, 1px))); z-index: 10; box-sizing: border-box; width: max(100%, calc(240 * var(--ds-media-unit, 1px))); max-width: min(calc(320 * var(--ds-media-unit, 1px)), calc(100vw - calc(32 * var(--ds-media-unit, 1px)))); padding: calc(6 * var(--ds-media-unit, 1px)); border: calc(1 * var(--ds-media-unit, 1px)) solid rgb(255 255 255 / 25%); border-radius: calc(6 * var(--ds-media-unit, 1px)); background: #303030; box-shadow: 0 calc(4 * var(--ds-media-unit, 1px)) calc(12 * var(--ds-media-unit, 1px)) rgb(0 0 0 / 35%); }
	.reference-picker[data-align="end"] .picker-panel { left: auto; right: 0; }
	.reference-picker.panel-only .picker-panel { position: static; display: flex; flex-direction: column; width: 100%; max-width: 100%; max-height: var(--reference-picker-max-height, none); }
	.reference-picker.panel-only .picker-panel input { flex: 0 0 auto; }
	.reference-picker.panel-only .options { min-height: 0; }
	.reference-picker[data-theme="light"] .picker-panel { background: #fff; border-color: rgb(31 41 55 / 25%); }
	.reference-picker input { box-sizing: border-box; width: 100%; min-width: 0; padding: calc(5 * var(--ds-media-unit, 1px)); border: calc(1 * var(--ds-media-unit, 1px)) solid rgb(127 127 127 / 60%); border-radius: calc(3 * var(--ds-media-unit, 1px)); background: transparent; color: inherit; font: inherit; }
	.reference-picker input::placeholder { color: inherit; opacity: 0.6; }
	.options { display: flex; flex-direction: column; gap: calc(2 * var(--ds-media-unit, 1px)); max-height: calc(200 * var(--ds-media-unit, 1px)); overflow-y: auto; margin-top: calc(4 * var(--ds-media-unit, 1px)); }
	.reference-picker .option { flex: 0 0 auto; padding: calc(5 * var(--ds-media-unit, 1px)); overflow-wrap: anywhere; }
	.reference-picker .option.highlighted { background: rgb(127 127 127 / 30%); }
	.option[aria-selected="true"] { font-weight: 700; }
	.empty { margin: calc(6 * var(--ds-media-unit, 1px)) 0 calc(2 * var(--ds-media-unit, 1px)); opacity: 0.7; }
</style>
