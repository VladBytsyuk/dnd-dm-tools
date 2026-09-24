<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import type Sword from "lucide-svelte/icons/sword";
	import { sanitizeRichHtml } from "./sanitizeRichHtml";

	type Icon = typeof Sword;

	type Props = {
		text?: string;
		html?: string;
		suffix?: string;
		icon?: Icon;
		iconTooltip?: string;
		imageSrc?: string;
		imageAlt?: string;
		href?: string;
		onLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		onTextChange?: (text: string) => void;
		onHtmlChange?: (html: string) => void;
		onEntityLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		editable?: boolean;
		background?: string;
		theme?: "dark" | "light";
	};

	let {
		text = $bindable(""),
		html = $bindable<string | undefined>(),
		suffix,
		icon: Icon,
		iconTooltip,
		imageSrc,
		imageAlt = "",
		href,
		onLinkClick,
		onTextChange,
		onHtmlChange,
		onEntityLinkClick,
		editable = false,
		background = "#d4d4d4",
		theme = "dark",
	}: Props = $props();

	const dndEntityPathPrefixes = [
		"/bestiary/",
		"/spells/",
		"/screens/",
		"/weapons/",
		"/armors/",
		"/backgrounds/",
		"/feats/",
		"/races/",
		"/classes/",
		"/character-sheets/",
		"/items/magic/",
		"/items/",
	] as const;

	function handleTextInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		text = value;
		onTextChange?.(value);
	}

	function handleHtmlInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		html = value;
		onHtmlChange?.(value);
	}

	function handleLinkClick(event: MouseEvent) {
		if (!href || !onLinkClick) return;

		event.preventDefault();
		void onLinkClick({ href, label: text });
	}

	function handleHtmlLinkClick(event: MouseEvent) {
		if (!(event.target instanceof Element)) return;

		const link = event.target.closest<HTMLAnchorElement>("a[href]");
		if (!link) return;
		const href = link.getAttribute("href") ?? "";

		if (!onEntityLinkClick || !dndEntityPathPrefixes.some((prefix) => href.startsWith(prefix))) return;

		event.preventDefault();
		void onEntityLinkClick({ href, label: link.textContent?.trim() ?? "" });
	}

	function richHtmlLinkListener(node: HTMLElement) {
		node.addEventListener("click", handleHtmlLinkClick);
		return { destroy: () => node.removeEventListener("click", handleHtmlLinkClick) };
	}
</script>

<span class="chip" data-editable={editable} data-theme={theme} style:--chip-background={background}>
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
	{#if editable && html !== undefined}
		<input value={html} oninput={handleHtmlInput} aria-label="HTML чипа" />
	{:else if editable}
		<input value={text} oninput={handleTextInput} aria-label="Текст чипа" />
		{:else if html !== undefined}
		<span class="html" use:richHtmlLinkListener>{@html sanitizeRichHtml(html)}</span>
	{:else if href && text}
		<a class="text link" {href} onclick={handleLinkClick}>{text}</a>
	{:else if text}
		<span class="text">{text}</span>
	{/if}
	{#if suffix}<span class="suffix">{suffix}</span>{/if}
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
		background: color-mix(in srgb, var(--chip-background) 40%, transparent);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
		font-size: 8px;
		font-weight: 400;
		line-height: 10px;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.chip:hover {
		background: linear-gradient(rgb(48 48 48 / 20%), rgb(48 48 48 / 20%)), color-mix(in srgb, var(--chip-background) 40%, transparent);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.chip:active {
		background: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), color-mix(in srgb, var(--chip-background) 40%, transparent);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
	}

	.chip[data-theme="light"] { color: #1f2937; }
	.chip[data-theme="light"]:hover { background: linear-gradient(rgb(15 23 42 / 12%), rgb(15 23 42 / 12%)), color-mix(in srgb, var(--chip-background) 40%, transparent); }
	.chip[data-theme="light"]:active { background: linear-gradient(rgb(15 23 42 / 24%), rgb(15 23 42 / 24%)), color-mix(in srgb, var(--chip-background) 40%, transparent); }

	.icon-wrapper { position: relative; align-self: flex-start; display: inline-flex; flex: 0 0 auto; padding: 0; border: 0; background: transparent; color: inherit; outline: none; }
	.icon-wrapper:focus-visible { outline: 1px solid currentcolor; border-radius: 2px; }
	.image { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 2px; object-fit: cover; }
	.text { min-width: 0; overflow-wrap: anywhere; }
	.html { min-width: 0; overflow-wrap: anywhere; }
	.html :global(p) { display: inline; margin: 0; }
	.html :global(a) { color: inherit; text-decoration: underline; }
	.link { color: inherit; text-decoration: underline; }
	.suffix { flex: 0 1 auto; overflow-wrap: anywhere; }
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
