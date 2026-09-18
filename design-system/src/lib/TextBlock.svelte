<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import "./table.css";
	import type ChevronRight from "lucide-svelte/icons/chevron-right";

	type Icon = typeof ChevronRight;

	type Props = {
		title?: string;
		text?: string;
		html?: string;
		icon?: Icon;
		expanded?: boolean;
		accentColor?: string;
		onSpellLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		onEntityLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		title = $bindable(""),
		text = $bindable(""),
		html,
		icon: Icon,
		expanded = true,
		accentColor = "#d4d4d4",
		onSpellLinkClick,
		onEntityLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	function getInitialExpanded() {
		return expanded;
	}

	let isExpanded = $state(getInitialExpanded());
	let isCollapsible = $derived(Boolean(Icon && title));
	let isContentVisible = $derived(!isCollapsible || isExpanded || editable);
	let decoratedHtml = $derived(decorateTables(html ?? ""));

	function decorateTables(value: string): string {
		return value.replace(
			/<table\b/gi,
			`<table class="dnd-table" data-theme="${theme}" style="--dnd-table-accent: ${accentColor};"`,
		);
	}

	function handleRichTextClick(event: MouseEvent) {
		if (!(event.target instanceof Element)) return;

		const link = event.target.closest<HTMLAnchorElement>("a[href]");
		if (!link) return;
		const href = link.getAttribute("href") ?? "";
		const value = { href, label: link.textContent?.trim() ?? "" };

		if (onEntityLinkClick && href.startsWith("/")) {
			event.preventDefault();
			void onEntityLinkClick(value);
			return;
		}

		if (!onSpellLinkClick || !href.startsWith("/spells/")) return;

		event.preventDefault();
		void onSpellLinkClick(value);
	}

	function richTextLinkListener(node: HTMLElement) {
		node.addEventListener("click", handleRichTextClick);
		return { destroy: () => node.removeEventListener("click", handleRichTextClick) };
	}
</script>

<section class="text-block" data-theme={theme}>
	{#if title || editable}
		{#if isCollapsible && !editable}
			<button
				type="button"
				class="header toggle"
				aria-expanded={isExpanded}
				onclick={() => (isExpanded = !isExpanded)}
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
		{:else if html !== undefined}
			<div class="rich-content" use:richTextLinkListener>
				{@html decoratedHtml}
			</div>
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

	.text-block[data-theme="light"] { color: #1f2937; }

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

	p, textarea, .rich-content {
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

	.rich-content :global(p) { margin: 0; }
	.rich-content :global(p + p) { margin-top: 4px; }
	.rich-content :global(a) { color: inherit; text-decoration: underline; }
	.rich-content :global(.dnd-table) { margin: 4px 0; }

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
