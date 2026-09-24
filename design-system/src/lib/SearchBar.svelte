<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import type { SvelteHTMLElements } from "svelte/elements";
	import Search from "lucide-svelte/icons/search";

	type Icon = typeof Search;

	export type SearchBarAction = {
		icon: Icon;
		label: string;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
	};

	type Props = SvelteHTMLElements["input"] & {
		value?: string;
		placeholder?: string;
		theme?: "dark" | "light";
		searchIcon?: Icon;
		leadingAction?: SearchBarAction;
		actions?: SearchBarAction[];
	};

	let {
		value = $bindable(""),
		placeholder = "Начните искать",
		theme = "dark",
		searchIcon: SearchIcon,
		leadingAction,
		actions = [],
		...inputProps
	}: Props = $props();
</script>

<div class="search-bar" data-theme={theme}>
	{#if leadingAction}
		{@const Icon = leadingAction.icon}
		<button
			class="icon-button leading-action"
			type="button"
			aria-label={leadingAction.label}
			disabled={leadingAction.disabled}
			onclick={leadingAction.onclick}
		>
			<Icon size={32} strokeWidth={2} />
		</button>
	{/if}

	<label class="input-area">
		<input {...inputProps} bind:value placeholder="" aria-label={inputProps["aria-label"] ?? placeholder} />
		{#if !value}
			<span class="placeholder" aria-hidden="true">
				{#if SearchIcon}
					<SearchIcon size={32} strokeWidth={2} />
				{/if}
				<span>{placeholder}</span>
			</span>
		{/if}
	</label>

	{#each actions as action}
		{@const Icon = action.icon}
		<button
			class="icon-button"
			type="button"
			aria-label={action.label}
			disabled={action.disabled}
			onclick={action.onclick}
		>
			<Icon size={32} strokeWidth={2} />
		</button>
	{/each}
</div>

<style>
	.search-bar {
		display: flex;
		align-items: stretch;
		width: 100%;
		height: 48px;
		max-height: 48px;
		min-width: 0;
		overflow: hidden;
		border-radius: 12px;
		background: rgb(0 0 0 / 20%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: 12px;
		font-weight: 400;
		line-height: 1;
	}

	.input-area {
		position: relative;
		display: flex;
		flex: 1 1 auto;
		min-width: 0;
		align-items: center;
		background: rgb(255 255 255 / 8%);
	}

	input {
		width: 100%;
		min-width: 0;
		height: 100%;
		padding: 0 16px;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	input:focus-visible {
		outline: 2px solid currentcolor;
		outline-offset: -2px;
	}

	.placeholder {
		position: absolute;
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		color: rgb(255 255 255 / 80%);
		pointer-events: none;
		white-space: nowrap;
	}

	.placeholder span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.icon-button {
		display: grid;
		flex: 0 0 48px;
		width: 48px;
		height: 48px;
		place-items: center;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.icon-button:hover:not(:disabled) { background: rgb(255 255 255 / 8%); }
	.icon-button:focus-visible { outline: 2px solid currentcolor; outline-offset: -2px; }
	.icon-button:disabled { cursor: not-allowed; opacity: 0.45; }
	.leading-action :global(svg) { transform: rotate(180deg); }

	.search-bar[data-theme="light"] {
		background: rgb(15 23 42 / 12%);
		color: #1f2937;
	}

	.search-bar[data-theme="light"] .input-area { background: rgb(255 255 255 / 84%); }
	.search-bar[data-theme="light"] .placeholder { color: rgb(31 41 55 / 70%); }
	.search-bar[data-theme="light"] .icon-button:hover:not(:disabled) { background: rgb(15 23 42 / 8%); }
</style>
