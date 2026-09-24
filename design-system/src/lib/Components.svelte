<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import HandHelping from "lucide-svelte/icons/hand-helping";
	import PackageOpen from "lucide-svelte/icons/package-open";
	import Speech from "lucide-svelte/icons/speech";

	type Props = {
		somatic?: boolean;
		verbal?: boolean;
		material?: string;
		background?: string;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		somatic = $bindable(false),
		verbal = $bindable(false),
		material = $bindable<string | undefined>(),
		background = "#d4d4d4",
		editable = false,
		theme = "dark",
	}: Props = $props();

	let materialIsActive = $derived(material !== undefined);

	function toggleMaterial() {
		material = materialIsActive ? undefined : "";
	}
</script>

<div class="components" data-theme={theme} aria-label="Компоненты заклинания">
	{#if editable || somatic}
		<span
			class:inactive={!somatic}
			class:editable
			class="component-chip"
			style:--component-background={background}
		>
			<button
				type="button"
				class="icon-button"
				aria-label="Соматический"
				aria-pressed={editable ? somatic : undefined}
				onclick={editable ? () => (somatic = !somatic) : undefined}
			>
				<HandHelping size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Соматический</span>
			</button>
		</span>
	{/if}

	{#if editable || verbal}
		<span
			class:inactive={!verbal}
			class:editable
			class="component-chip"
			style:--component-background={background}
		>
			<button
				type="button"
				class="icon-button"
				aria-label="Вербальный"
				aria-pressed={editable ? verbal : undefined}
				onclick={editable ? () => (verbal = !verbal) : undefined}
			>
				<Speech size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Вербальный</span>
			</button>
		</span>
	{/if}

	{#if editable || materialIsActive}
		<span
			class:inactive={!materialIsActive}
			class:editable
			class="component-chip material"
			style:--component-background={background}
		>
			<button
				type="button"
				class="icon-button"
				aria-label="Материальный"
				aria-pressed={editable ? materialIsActive : undefined}
				onclick={editable ? toggleMaterial : undefined}
			>
				<PackageOpen size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Материальный</span>
			</button>
			{#if editable && materialIsActive}
				<input class="material-text" bind:value={material} aria-label="Материальный компонент" />
			{:else}
				<span class="material-text">{material}</span>
			{/if}
		</span>
	{/if}
</div>

<style>
	.components {
		display: flex;
		align-items: flex-start;
		gap: 4px;
		width: 100%;
		min-width: 0;
	}

	.component-chip {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-width: 16px;
		min-height: 16px;
		padding: 2px;
		border-radius: 4px;
		background: color-mix(in srgb, var(--component-background) 40%, transparent);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.component-chip:hover {
		background: linear-gradient(rgb(48 48 48 / 20%), rgb(48 48 48 / 20%)), color-mix(in srgb, var(--component-background) 40%, transparent);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.component-chip:active {
		background: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), color-mix(in srgb, var(--component-background) 40%, transparent);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
	}

	.components[data-theme="light"] .component-chip { color: #1f2937; }
	.components[data-theme="light"] .component-chip:hover { background: linear-gradient(rgb(15 23 42 / 12%), rgb(15 23 42 / 12%)), color-mix(in srgb, var(--component-background) 40%, transparent); }
	.components[data-theme="light"] .component-chip:active { background: linear-gradient(rgb(15 23 42 / 24%), rgb(15 23 42 / 24%)), color-mix(in srgb, var(--component-background) 40%, transparent); }

	.component-chip.inactive {
		opacity: 0.4;
	}

	.material {
		flex: 0 1 auto;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 4px;
		max-width: 100%;
	}

	.icon-button {
		position: relative;
		display: inline-flex;
		flex: 0 0 12px;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: default;
	}

	.component-chip.editable .icon-button {
		cursor: pointer;
	}

	.icon-button:focus-visible {
		outline: 1px solid currentcolor;
		outline-offset: 1px;
		border-radius: 2px;
	}

	.tooltip {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		z-index: 1;
		width: max-content;
		max-width: 200px;
		padding: 6px 8px;
		border-radius: 4px;
		background: #18181b;
		box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: 10px;
		line-height: 12px;
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 2px);
		transition: opacity 120ms ease, transform 120ms ease;
	}

	.icon-button:hover .tooltip,
	.icon-button:focus-visible .tooltip {
		opacity: 1;
		transform: translate(-50%, 0);
	}

	.material-text {
		min-width: 0;
		color: rgb(255 255 255 / 75%);
		font-family: "Golos Text", sans-serif;
		font-size: 8px;
		font-weight: 400;
		line-height: 12px;
		overflow-wrap: anywhere;
	}

	.components[data-theme="light"] .material-text { color: rgb(31 41 55 / 75%); }

	input.material-text {
		box-sizing: border-box;
		flex: 1 1 auto;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		appearance: none;
		background: transparent;
		text-align: inherit;
	}

	input.material-text:focus-visible {
		outline: 1px solid currentcolor;
		outline-offset: 1px;
	}
</style>
