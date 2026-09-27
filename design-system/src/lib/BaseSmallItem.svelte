<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import "./colors.css";
	import type { SvelteHTMLElements } from "svelte/elements";
	import UserCog from "lucide-svelte/icons/user-cog";

	type Icon = typeof UserCog;
	export type SmallItemMetaIcon = { icon: Icon; label: string };

	type Props = SvelteHTMLElements["article"] & {
		accentColor?: string;
		primaryColor?: string;
		secondaryColor?: string;
		overlayOpacity?: string;
		height?: number;
		value?: string | number;
		title?: string;
		subtitle?: string;
		description?: string;
		imageSrc?: string;
		imageAlt?: string;
		source?: string;
		secondarySource?: string;
		centerIcons?: SmallItemMetaIcon[];
		bottomIcons?: SmallItemMetaIcon[];
		metaWidth?: number;
		icon?: Icon;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
	};

	let {
		accentColor,
		primaryColor = "#303030",
		secondaryColor = "#303030",
		overlayOpacity,
		height = 64,
		value,
		title,
		subtitle,
		description,
		imageSrc,
		imageAlt = "",
		source,
		secondarySource,
		centerIcons = [],
		bottomIcons = [],
		metaWidth = 32,
		icon: Icon,
		state = "default",
		theme = "dark",
		...articleProps
	}: Props = $props();

	function resolveThemeColor(color: string | undefined): string | undefined {
		return theme === "light"
			? color?.replace(/var\((--ds-[\w-]+)\)/gu, "var($1-light)")
			: color;
	}

	let resolvedAccentColor = $derived(resolveThemeColor(accentColor));
	let resolvedPrimaryColor = $derived(resolveThemeColor(primaryColor));
	let resolvedSecondaryColor = $derived(resolveThemeColor(secondaryColor));
	let resolvedOverlayOpacity = $derived(overlayOpacity ?? (theme === "light" ? "0%" : "40%"));
</script>

<article
	{...articleProps}
	class="small-item"
	data-state={state}
	data-theme={theme}
	data-has-accent={Boolean(accentColor)}
	data-has-value={value !== undefined && !imageSrc}
	data-has-meta={Boolean(source || secondarySource || centerIcons.length || bottomIcons.length || Icon)}
	data-has-image={Boolean(imageSrc)}
	data-has-description={Boolean(description)}
	style={`--accent-color: ${resolvedAccentColor}; --primary-color: ${resolvedPrimaryColor}; --secondary-color: ${resolvedSecondaryColor}; --overlay-opacity: ${resolvedOverlayOpacity}; --item-height: ${height}px; --meta-width: ${metaWidth}px`}
>
	{#if accentColor}
		<div class="accent" aria-hidden="true"></div>
	{/if}
	{#if value !== undefined && !imageSrc}
		<div class="value">{value}</div>
	{/if}
	{#if imageSrc}
		<img class="image" src={imageSrc} alt={imageAlt} />
	{/if}
	{#if title || subtitle || description}
		<div class="content">
			{#if title || subtitle}
				<div class="titles">
					{#if title}<strong title={title}>{title}</strong>{/if}
					{#if subtitle}<span title={subtitle}>{subtitle}</span>{/if}
				</div>
			{/if}
		{#if description}<p title={description}>{description}</p>{/if}
		</div>
	{/if}
	{#if source || secondarySource || Icon}
		<div class="meta">
			{#if source}<span>{source}</span>{/if}
			{#if centerIcons.length}
				<div class="meta-icons meta-center">
					{#each centerIcons as item}
						{@const MetaIcon = item.icon}
						<span role="img" aria-label={item.label} title={item.label}><MetaIcon size={14} strokeWidth={1.5} aria-hidden={true} /></span>
					{/each}
				</div>
			{/if}
			{#if secondarySource}<span>{secondarySource}</span>{/if}
			{#if bottomIcons.length}
				<div class="meta-icons meta-bottom">
					{#each bottomIcons as item}
						{@const MetaIcon = item.icon}
						<span role="img" aria-label={item.label} title={item.label}><MetaIcon size={14} strokeWidth={1.5} aria-hidden={true} /></span>
					{/each}
				</div>
			{/if}
			{#if Icon}<Icon size={16} strokeWidth={1} />{/if}
		</div>
	{/if}
</article>

<style>
	.small-item {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: 8px 48px minmax(0, 1fr) var(--meta-width);
		width: 100%;
		min-width: 0;
		height: var(--item-height);
		overflow: hidden;
		position: relative;
		border: 0;
		border-radius: 8px;
		background:
			linear-gradient(rgb(48 48 48 / var(--overlay-opacity)), rgb(48 48 48 / var(--overlay-opacity))),
			linear-gradient(105deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}
	.small-item[data-has-description="true"] { height: max(var(--item-height), 72px); }

	.small-item::after {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: transparent;
		content: "";
		pointer-events: none;
		transition: background-color 120ms ease;
	}
	.small-item:hover, .small-item[data-state="hovered"] { box-shadow: 0 6px 6px rgb(0 0 0 / 25%); }
	.small-item:hover::after, .small-item[data-state="hovered"]::after { background: rgb(0 0 0 / 10%); }
	.small-item:active, .small-item[data-state="clicked"] { box-shadow: 0 1px 1px rgb(0 0 0 / 25%); }
	.small-item:active::after, .small-item[data-state="clicked"]::after { background: rgb(0 0 0 / 25%); }
	.small-item[data-theme="light"] { color: #1f2937; }
	.small-item[data-theme="light"]:hover::after, .small-item[data-theme="light"][data-state="hovered"]::after { background: rgb(15 23 42 / 12%); }
	.small-item[data-theme="light"]:active::after, .small-item[data-theme="light"][data-state="clicked"]::after { background: rgb(15 23 42 / 24%); }
	.accent { background: var(--accent-color); }
	.value { display: grid; place-items: center; padding: 8px; font-size: 36px; font-weight: 700; line-height: 1; }
	.image { display: block; width: 100%; height: 100%; min-width: 0; min-height: 0; max-width: var(--item-height); max-height: 100%; object-fit: contain; padding: 4px; box-sizing: border-box; }
	.content, .meta { display: flex; flex-direction: column; justify-content: space-between; }
	.content { min-width: 0; padding: 8px; }
	.titles { display: grid; gap: 2px; }
	.content strong, .content span, .content p, .meta span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.content strong { font-size: 18px; font-weight: 700; line-height: 21px; }
	.content span, .content p, .meta span { font-size: 12px; font-weight: 400; line-height: 15px; }
	.content p { margin: 0; }
	.meta { align-items: end; min-width: 0; padding: 8px; color: rgb(255 255 255 / 80%); }
	.meta-icons { display: flex; align-items: center; justify-content: flex-end; gap: 2px; }
	.meta-center { flex: 1 1 auto; align-self: stretch; }
	.meta-icons span { display: inline-flex; flex: 0 0 auto; }
	.small-item[data-theme="light"] .meta { color: rgb(31 41 55 / 80%); }
	.small-item[data-has-accent="true"][data-has-value="false"] { grid-template-columns: 8px minmax(0, 1fr) var(--meta-width); }
	.small-item[data-has-accent="true"][data-has-meta="false"] { grid-template-columns: 8px 48px minmax(0, 1fr); }
	.small-item[data-has-accent="true"][data-has-value="false"][data-has-meta="false"] { grid-template-columns: 8px minmax(0, 1fr); }
	.small-item[data-has-accent="false"] { grid-template-columns: 48px minmax(0, 1fr) var(--meta-width); }
	.small-item[data-has-accent="false"][data-has-value="false"] { grid-template-columns: minmax(0, 1fr) var(--meta-width); }
	.small-item[data-has-accent="false"][data-has-meta="false"] { grid-template-columns: 48px minmax(0, 1fr); }
	.small-item[data-has-accent="false"][data-has-value="false"][data-has-meta="false"] { grid-template-columns: minmax(0, 1fr); }
	.small-item[data-has-image="true"][data-has-accent="false"] { grid-template-columns: minmax(64px, var(--item-height)) minmax(0, 1fr) auto; }
	.small-item[data-has-image="true"][data-has-accent="true"] { grid-template-columns: 8px minmax(64px, var(--item-height)) minmax(0, 1fr) auto; }
	.small-item[data-has-image="true"] .content { padding-left: 4px; }
	.small-item[data-has-image="true"] .meta { align-self: stretch; }
</style>
