<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import type ChevronRight from "lucide-svelte/icons/chevron-right";

	type Icon = typeof ChevronRight;

	type Props = {
		title?: string;
		text?: string;
		icon?: Icon;
		expanded?: boolean;
		editable?: boolean;
	};

	let {
		title = $bindable(""),
		text = $bindable(""),
		icon: Icon,
		expanded = $bindable(true),
		editable = false,
	}: Props = $props();

	let isCollapsible = $derived(Boolean(Icon && title));
	let isContentVisible = $derived(!isCollapsible || expanded || editable);
</script>

<section class="text-block">
	{#if title || editable}
		{#if isCollapsible && !editable}
			<button
				type="button"
				class="header toggle"
				aria-expanded={expanded}
				onclick={() => (expanded = !expanded)}
			>
				<Icon class="icon" size={14} strokeWidth={2} aria-hidden={true} />
				<span>{title}</span>
			</button>
		{:else}
			<div class="header">
				{#if isCollapsible}<Icon class="icon" size={14} strokeWidth={2} aria-hidden={true} />{/if}
				{#if editable}
					<input bind:value={title} aria-label="Заголовок текстового блока" />
				{:else}
					<span>{title}</span>
				{/if}
			</div>
		{/if}
	{/if}

	{#if isContentVisible}
		{#if editable}
			<textarea bind:value={text} aria-label="Текст блока" rows={1}></textarea>
		{:else if text}
			<p>{text}</p>
		{/if}
	{/if}
</section>

<style>
	.text-block {
		display: grid;
		gap: 4px;
		width: 100%;
		min-width: 0;
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		color: inherit;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
	}

	.header > span { overflow-wrap: anywhere; }
	.toggle {
		width: fit-content;
		max-width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		font-family: inherit;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
		text-align: left;
		cursor: pointer;
	}
	.toggle:hover { text-decoration: underline; }
	.toggle:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	:global(.icon) { flex: 0 0 auto; }
	.toggle[aria-expanded="true"] :global(.icon) { transform: rotate(90deg); }

	p, textarea {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		margin: 0;
		color: inherit;
		font: inherit;
		font-size: 10px;
		font-weight: 400;
		line-height: 12px;
		overflow-wrap: anywhere;
	}

	input, textarea {
		padding: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
	}
	.header input {
		min-width: 0;
		font-family: inherit;
		font-size: 12px;
		font-weight: 700;
		line-height: 14px;
	}
	textarea {
		field-sizing: content;
		min-height: 24px;
		resize: vertical;
		font-family: inherit;
		font-size: 10px;
		font-weight: 400;
		line-height: 12px;
	}
	input:focus-visible, textarea:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
</style>
