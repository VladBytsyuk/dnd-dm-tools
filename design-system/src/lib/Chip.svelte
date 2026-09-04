<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import type Sword from "lucide-svelte/icons/sword";

	type Icon = typeof Sword;

	type Props = {
		text?: string;
		icon?: Icon;
		iconTooltip?: string;
		imageSrc?: string;
		imageAlt?: string;
		editable?: boolean;
	};

	let {
		text = $bindable(""),
		icon: Icon,
		iconTooltip,
		imageSrc,
		imageAlt = "",
		editable = false,
	}: Props = $props();
</script>

<span class="chip" data-editable={editable}>
	{#if Icon}
		{#if iconTooltip}
			<button type="button" class="icon-wrapper" aria-label={iconTooltip}>
				<Icon size={10} strokeWidth={1.5} aria-hidden={true} />
				<span class="tooltip" role="tooltip">{iconTooltip}</span>
			</button>
		{:else}
			<span class="icon-wrapper"><Icon size={10} strokeWidth={1.5} /></span>
		{/if}
	{/if}
	{#if imageSrc}<img class="image" src={imageSrc} alt={imageAlt} />{/if}
	{#if editable}
		<input bind:value={text} aria-label="Текст чипа" />
	{:else}
		<span class="text">{text}</span>
	{/if}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		width: fit-content;
		max-width: 100%;
		min-width: 0;
		padding: 2px;
		border-radius: 4px;
		background: rgb(212 212 212 / 40%);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: 8px;
		font-weight: 400;
		line-height: 10px;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.chip:hover {
		background: linear-gradient(rgb(48 48 48 / 20%), rgb(48 48 48 / 20%)), rgb(212 212 212 / 40%);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.chip:active {
		background: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), rgb(212 212 212 / 40%);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
	}

	.icon-wrapper { position: relative; align-self: flex-start; display: inline-flex; flex: 0 0 auto; padding: 0; border: 0; background: transparent; color: #fff; outline: none; }
	.icon-wrapper:focus-visible { outline: 1px solid #fff; border-radius: 2px; }
	.image { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 2px; object-fit: cover; }
	.text { min-width: 0; overflow-wrap: anywhere; }
	input {
		width: 100%;
		min-width: 0;
		padding: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		line-height: inherit;
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
		font-size: 10px;
		line-height: 12px;
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 2px);
		transition: opacity 120ms ease, transform 120ms ease;
	}
	.icon-wrapper:hover .tooltip, .icon-wrapper:focus-visible .tooltip { opacity: 1; transform: translate(-50%, 0); }
</style>
