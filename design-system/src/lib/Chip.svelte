<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import type Sword from "lucide-svelte/icons/sword";
	import { sanitizeRichHtml } from "./sanitizeRichHtml";
	import { keepTooltipInBounds } from "./keepTooltipInBounds";

	type Icon = typeof Sword;

	type Props = {
		text?: string;
		placeholder?: string;
		html?: string;
		suffix?: string;
		toggle?: boolean;
		active?: boolean;
		onToggle?: () => void;
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
		placeholder = "Текст чипа",
		html = $bindable<string | undefined>(),
		suffix,
		toggle = false,
		active = false,
		onToggle,
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

<span class="chip" class:inactive={toggle && !active} data-editable={editable} data-theme={theme} data-toggle={toggle} data-active={active} style:--chip-background={background}>
	{#if Icon}
		{#if toggle && editable}
			<button type="button" class="icon-wrapper" aria-label={iconTooltip} aria-pressed={active} onclick={onToggle} use:keepTooltipInBounds>
				<Icon size={15} strokeWidth={1.5} aria-hidden={true} />
				<span class="chip-tooltip" role="tooltip">{iconTooltip}</span>
			</button>
		{:else if toggle}
			<span class="icon-wrapper" use:keepTooltipInBounds>
				<Icon size={15} strokeWidth={1.5} aria-hidden={true} />
				<span class="chip-tooltip" role="tooltip">{iconTooltip}</span>
			</span>
		{:else if iconTooltip}
			<button type="button" class="icon-wrapper" aria-label={iconTooltip} use:keepTooltipInBounds>
				<Icon size={15} strokeWidth={1.5} aria-hidden={true} />
				<span class="chip-tooltip" role="tooltip">{iconTooltip}</span>
			</button>
		{:else}
			<span class="icon-wrapper"><Icon size={15} strokeWidth={1.5} /></span>
		{/if}
	{/if}
	{#if imageSrc}<img class="image" src={imageSrc} alt={imageAlt} />{/if}
	{#if !toggle && editable && onTextChange}
		<input value={suffix ? `${text} (${suffix})` : text} oninput={handleTextInput} {placeholder} aria-label="Текст чипа" />
	{:else if !toggle && editable && html !== undefined}
		<input value={html} oninput={handleHtmlInput} placeholder="Текст или HTML" aria-label="HTML чипа" />
	{:else if !toggle && editable}
		<input value={suffix ? `${text} (${suffix})` : text} oninput={handleTextInput} {placeholder} aria-label="Текст чипа" />
		{:else if html !== undefined}
		<span class="html" use:richHtmlLinkListener>{@html sanitizeRichHtml(html)}</span>
	{:else if href && text}
		<a class="text link" {href} onclick={handleLinkClick}>{text}</a>
	{:else if text}
		<span class="text">{text}</span>
	{/if}
	{#if !editable && suffix}<span class="suffix">({suffix})</span>{/if}
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
		font-size: 12px;
		font-weight: 400;
		line-height: 15px;
		transition: background-color 120ms ease, box-shadow 120ms ease;
	}

	.chip :global(.dice-roller) { color: #fff; }
	.chip[data-theme="light"] :global(.dice-roller) { color: #1f2937; }

	.chip:hover {
		background: linear-gradient(rgb(48 48 48 / 20%), rgb(48 48 48 / 20%)), color-mix(in srgb, var(--chip-background) 40%, transparent);
		box-shadow: 0 6px 6px rgb(0 0 0 / 25%);
	}

	.chip:active {
		background: linear-gradient(rgb(0 0 0 / 40%), rgb(0 0 0 / 40%)), color-mix(in srgb, var(--chip-background) 40%, transparent);
		box-shadow: 0 1px 1px rgb(0 0 0 / 25%);
	}

	.chip[data-theme="light"] { color: #1f2937; }
	.chip.inactive { opacity: 0.4; }
	.chip[data-theme="light"]:hover { background: linear-gradient(rgb(15 23 42 / 12%), rgb(15 23 42 / 12%)), color-mix(in srgb, var(--chip-background) 40%, transparent); }
	.chip[data-theme="light"]:active { background: linear-gradient(rgb(15 23 42 / 24%), rgb(15 23 42 / 24%)), color-mix(in srgb, var(--chip-background) 40%, transparent); }

	.icon-wrapper { all: unset; box-sizing: border-box; position: relative; align-self: flex-start; display: inline-flex; flex: 0 0 auto; padding: 0; border: 0; background: transparent; color: inherit; outline: none; }
	.chip button.icon-wrapper { appearance: none; min-height: 0; border: 0; border-radius: 0; box-shadow: none; background: transparent; padding: 0; }
	.chip button.icon-wrapper { cursor: pointer; }
	.icon-wrapper:focus-visible { outline: 1px solid currentcolor; border-radius: 2px; }
	.image { flex: 0 0 auto; width: 10px; height: 10px; border-radius: 2px; object-fit: cover; }
	.text { min-width: 0; overflow-wrap: anywhere; }
	.html { min-width: 0; overflow-wrap: anywhere; }
	.html :global(p) { display: inline; margin: 0; }
	.html :global(a) { color: inherit; text-decoration: underline; }
	.link { color: inherit; text-decoration: underline; }
	.chip[data-theme="light"] .html :global(a), .chip[data-theme="light"] .link { color: #1f2937; }
	.suffix { flex: 0 1 auto; overflow-wrap: anywhere; }
	input {
		all: unset;
		box-sizing: border-box;
		display: block;
		width: 100%;
		min-width: 0;
		color: inherit;
		font: inherit;
		line-height: inherit;
	}
	.chip input::placeholder { color: currentcolor; opacity: 0.65; }
	.chip-tooltip {
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
		font-size: 15px;
		line-height: 18px;
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transform: translate(calc(-50% + var(--tooltip-shift-x, 0px)), 2px);
		transition: opacity 120ms ease, transform 120ms ease, visibility 120ms ease;
	}
	.chip button.icon-wrapper:hover .chip-tooltip,
	.chip button.icon-wrapper:focus-visible .chip-tooltip {
		visibility: visible;
		opacity: 1;
		transform: translate(calc(-50% + var(--tooltip-shift-x, 0px)), 0);
	}
</style>
