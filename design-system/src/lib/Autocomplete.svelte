<script lang="ts">
	import { tick } from "svelte";
	import type { ReferenceOption } from "./ReferencePicker.svelte";
	import "@fontsource/golos-text/400.css";

	let { label, value = $bindable(""), options = [], placeholder = "", disabled = false, theme = "dark", onValueChange, onSelect }: {
		label: string;
		value?: string;
		options?: ReferenceOption[];
		placeholder?: string;
		disabled?: boolean;
		theme?: "dark" | "light";
		onValueChange?: (value: string) => void;
		onSelect?: (option: ReferenceOption) => void;
	} = $props();
	const id = $props.id();
	let root: HTMLDivElement;
	let open = $state(false);
	let activeIndex = $state(-1);
	const filtered = $derived(options.filter((option) => option.label.toLocaleLowerCase("ru").includes(value.trim().toLocaleLowerCase("ru"))));
	const active = $derived(activeIndex >= 0 && activeIndex < filtered.length ? activeIndex : -1);
	$effect(() => { if (disabled) open = false; });

	function choose(option: ReferenceOption) {
		if (disabled) return;
		value = option.label;
		onValueChange?.(value);
		open = false; activeIndex = -1;
		onSelect?.(option);
	}
	async function handleKey(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); open = false; activeIndex = -1; return; }
		if (event.key === "Enter" && open && active >= 0) { event.preventDefault(); choose(filtered[active]); return; }
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
		event.preventDefault(); open = true;
		if (!filtered.length) return;
		activeIndex = active < 0 ? event.key === "ArrowDown" ? 0 : filtered.length - 1 : (active + (event.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
		await tick();
		root.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
	}
</script>

<svelte:window onpointerdown={(event) => { if (open && event.target instanceof Node && !root.contains(event.target)) open = false; }} />
<div class="autocomplete" data-theme={theme} bind:this={root} onfocusout={(event) => { if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) open = false; }}>
	<input role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
		{placeholder} {value} {disabled} autocomplete="off" onfocus={() => { open = true; activeIndex = -1; }} onclick={() => { open = true; activeIndex = -1; }}
		oninput={(event) => { value = event.currentTarget.value; open = true; activeIndex = -1; onValueChange?.(value); }} onkeydown={handleKey} />
	{#if open}
		<div class="suggestions">
			<div class="options" role="listbox" id={`${id}-list`} aria-label={label}>
				{#each filtered as option, index (option.value)}
					<button type="button" role="option" id={`${id}-option-${index}`} data-option-index={index} aria-selected={index === active} tabindex="-1"
						onpointerdown={(event) => event.preventDefault()} onpointermove={() => { activeIndex = index; }} onclick={() => choose(option)}>{option.label}</button>
				{/each}
			</div>
			{#if !filtered.length}<p role="status">Нет подсказок</p>{/if}
		</div>
	{/if}
</div>

<style>
	.autocomplete { position: relative; width: 100%; min-width: 0; color: #fff; font: inherit; font-family: "Golos Text", sans-serif; text-align: inherit; }
	.autocomplete[data-theme="light"] { color: #1f2937; }
	.autocomplete input { all: unset; box-sizing: border-box; display: block; width: 100%; min-width: 0; padding: calc(3 * var(--ds-media-unit, 1px)) calc(4 * var(--ds-media-unit, 1px)); border-radius: calc(4 * var(--ds-media-unit, 1px)); background: rgb(212 212 212 / 20%); color: inherit; font: inherit; text-align: inherit; cursor: text; }
	input::placeholder { color: currentcolor; opacity: 0.65; }
	input:disabled { opacity: 0.4; cursor: default; }
	.autocomplete input:focus-visible, .autocomplete button:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(1 * var(--ds-media-unit, 1px)); }
	.suggestions { position: absolute; z-index: 10; top: calc(100% + calc(4 * var(--ds-media-unit, 1px))); right: 0; box-sizing: border-box; width: max(100%, calc(200 * var(--ds-media-unit, 1px))); max-width: min(calc(320 * var(--ds-media-unit, 1px)), calc(100vw - calc(32 * var(--ds-media-unit, 1px)))); padding: calc(6 * var(--ds-media-unit, 1px)); border: calc(1 * var(--ds-media-unit, 1px)) solid rgb(255 255 255 / 25%); border-radius: calc(6 * var(--ds-media-unit, 1px)); background: #303030; color: #fff; box-shadow: 0 calc(4 * var(--ds-media-unit, 1px)) calc(12 * var(--ds-media-unit, 1px)) rgb(0 0 0 / 35%); font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(15 * var(--ds-media-unit, 1px)); text-align: left; }
	.autocomplete[data-theme="light"] .suggestions { background: #fff; color: #1f2937; border-color: rgb(31 41 55 / 25%); }
	.options { display: flex; flex-direction: column; gap: calc(2 * var(--ds-media-unit, 1px)); max-height: calc(200 * var(--ds-media-unit, 1px)); overflow-y: auto; }
	.autocomplete button { all: unset; box-sizing: border-box; flex: 0 0 auto; padding: calc(5 * var(--ds-media-unit, 1px)); border-radius: calc(4 * var(--ds-media-unit, 1px)); overflow-wrap: anywhere; cursor: pointer; }
	.autocomplete button[aria-selected="true"], .autocomplete button:hover { background: rgb(127 127 127 / 30%); }
	p { margin: calc(2 * var(--ds-media-unit, 1px)); opacity: 0.7; }
</style>
