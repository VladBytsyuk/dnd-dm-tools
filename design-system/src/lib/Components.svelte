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
	};

	let {
		somatic = false,
		verbal = false,
		material,
		background = "rgb(212 212 212 / 40%)",
	}: Props = $props();
</script>

<div class="components" aria-label="Компоненты заклинания">
	{#if somatic}
		<span class="component-chip" style:--component-background={background}>
			<button type="button" class="icon-button" aria-label="Соматический">
				<HandHelping size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Соматический</span>
			</button>
		</span>
	{/if}

	{#if verbal}
		<span class="component-chip" style:--component-background={background}>
			<button type="button" class="icon-button" aria-label="Вербальный">
				<Speech size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Вербальный</span>
			</button>
		</span>
	{/if}

	{#if material}
		<span class="component-chip material" style:--component-background={background}>
			<button type="button" class="icon-button" aria-label="Материальный">
				<PackageOpen size={12} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">Материальный</span>
			</button>
			<span class="material-text">{material}</span>
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
		background: var(--component-background);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.component-chip:hover {
		background: linear-gradient(rgb(48 48 48 / 20%), rgb(48 48 48 / 20%)), var(--component-background);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.component-chip:active {
		background: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), var(--component-background);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
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

	.icon-button:focus-visible {
		outline: 1px solid #fff;
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
</style>
