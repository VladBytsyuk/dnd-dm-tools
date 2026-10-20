<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "./colors.css";

	export type TabItem = { value: string; label: string; disabled?: boolean };
	type Props = {
		items: TabItem[];
		value?: string;
		id?: string;
		panelId?: string;
		ariaLabel?: string;
		accentColor?: string;
		theme?: "dark" | "light";
		onValueChange?: (value: string) => void;
	};
	const generatedId = $props.id();
	let { items, value = $bindable(""), id = generatedId, panelId, ariaLabel = "Разделы", accentColor = "currentColor", theme = "dark", onValueChange }: Props = $props();
	let tablist: HTMLDivElement;
	const enabledItems = $derived(items.filter((item) => !item.disabled));
	const selected = $derived(enabledItems.find((item) => item.value === value)?.value ?? enabledItems[0]?.value);

	function select(item: TabItem) {
		if (item.disabled || item.value === selected) return;
		value = item.value;
		onValueChange?.(item.value);
	}
	function handleKey(event: KeyboardEvent, item: TabItem) {
		if (!enabledItems.length || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const current = enabledItems.findIndex((entry) => entry.value === item.value);
		const next = event.key === "Home" ? 0 : event.key === "End" ? enabledItems.length - 1
			: (current + (event.key === "ArrowRight" ? 1 : -1) + enabledItems.length) % enabledItems.length;
		select(enabledItems[next]);
		tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')[next]?.focus();
	}
</script>

<div class="tabs" {id} data-theme={theme} style:--tabs-accent={accentColor} role="tablist" aria-label={ariaLabel} bind:this={tablist}>
	{#each items as item (item.value)}
		<button type="button" role="tab" id={`${id}-${encodeURIComponent(item.value)}`} aria-controls={panelId} aria-selected={item.value === selected}
			tabindex={item.value === selected ? 0 : -1} disabled={item.disabled} title={item.label}
			onclick={() => select(item)} onkeydown={(event) => handleKey(event, item)}>
			<span>{item.label}</span>
		</button>
	{/each}
</div>

<style>
	.tabs {
		box-sizing: border-box;
		display: flex;
		gap: 4px;
		width: 100%;
		min-width: 0;
		padding: 4px;
		border-radius: 12px;
		background: rgb(0 0 0 / 20%);
		color: #fff;
		font: 400 14px/20px "Golos Text", sans-serif;
	}
	.tabs button {
		all: unset;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex: 1 1 0;
		min-width: 0;
		min-height: 36px;
		align-items: center;
		justify-content: center;
		padding: 8px 12px;
		border-radius: 8px;
		color: inherit;
		font: inherit;
		text-align: center;
		cursor: pointer;
	}
	.tabs button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.tabs button:hover:not(:disabled):not([aria-selected="true"]) { background: rgb(255 255 255 / 8%); }
	.tabs button[aria-selected="true"] {
		background: linear-gradient(110deg, color-mix(in srgb, var(--tabs-accent) 28%, transparent), color-mix(in srgb, var(--tabs-accent) 12%, transparent)), rgb(255 255 255 / 8%);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tabs-accent) 60%, transparent);
	}
	.tabs button[aria-selected="true"]::after { content: ""; position: absolute; right: 12px; bottom: 3px; left: 12px; height: 2px; border-radius: 2px; background: var(--tabs-accent); }
	.tabs button:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
	.tabs button:disabled { opacity: 0.4; cursor: default; }
	.tabs[data-theme="light"] { background: rgb(15 23 42 / 12%); color: #1f2937; }
	.tabs[data-theme="light"] button:hover:not(:disabled):not([aria-selected="true"]) { background: rgb(15 23 42 / 8%); }
	.tabs[data-theme="light"] button[aria-selected="true"] { background: linear-gradient(110deg, color-mix(in srgb, var(--tabs-accent) 20%, transparent), color-mix(in srgb, var(--tabs-accent) 8%, transparent)), rgb(255 255 255 / 84%); }
</style>
