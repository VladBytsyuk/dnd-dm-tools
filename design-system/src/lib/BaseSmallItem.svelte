<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import "./colors.css";
	import type { SvelteHTMLElements } from "svelte/elements";
	import UserCog from "lucide-svelte/icons/user-cog";

	type Icon = typeof UserCog;

	type Props = SvelteHTMLElements["article"] & {
		accentColor?: string;
		primaryColor?: string;
		secondaryColor?: string;
		height?: number;
		value?: string | number;
		title?: string;
		subtitle?: string;
		description?: string;
		source?: string;
		secondarySource?: string;
		icon?: Icon;
		state?: "default" | "hovered" | "clicked";
		theme?: "dark" | "light";
	};

	let {
		accentColor,
		primaryColor = "#303030",
		secondaryColor = "#303030",
		height = 64,
		value,
		title,
		subtitle,
		description,
		source,
		secondarySource,
		icon: Icon,
		state = "default",
		theme = "dark",
		...articleProps
	}: Props = $props();
</script>

<article
	{...articleProps}
	class="small-item"
	data-state={state}
	data-theme={theme}
	data-has-accent={Boolean(accentColor)}
	data-has-value={value !== undefined}
	data-has-meta={Boolean(source || secondarySource || Icon)}
	style={`--accent-color: ${accentColor}; --primary-color: ${primaryColor}; --secondary-color: ${secondaryColor}; --item-height: ${height}px`}
>
	{#if accentColor}
		<div class="accent" aria-hidden="true"></div>
	{/if}
	{#if value !== undefined}
		<div class="value">{value}</div>
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
			{#if secondarySource}<span>{secondarySource}</span>{/if}
			{#if Icon}<Icon size={16} strokeWidth={1} />{/if}
		</div>
	{/if}
</article>

<style>
	.small-item {
		display: grid;
		grid-template-columns: 8px 48px minmax(0, 1fr) 32px;
		width: 100%;
		min-width: 0;
		height: var(--item-height);
		overflow: hidden;
		position: relative;
		border: 0;
		border-radius: 8px;
		background: linear-gradient(105deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

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
	.value { display: grid; place-items: center; padding: 8px; font-size: 24px; font-weight: 700; line-height: 1; }
	.content, .meta { display: flex; flex-direction: column; justify-content: space-between; }
	.content { min-width: 0; padding: 8px; }
	.titles { display: grid; gap: 2px; }
	.content strong, .content span, .content p, .meta span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.content strong { font-size: 12px; font-weight: 700; line-height: 14px; }
	.content span, .content p, .meta span { font-size: 8px; font-weight: 400; line-height: 10px; }
	.content p { margin: 0; }
	.meta { align-items: end; min-width: 0; padding: 8px; color: rgb(255 255 255 / 80%); }
	.small-item[data-theme="light"] .meta { color: rgb(31 41 55 / 80%); }
	.small-item[data-has-accent="true"][data-has-value="false"] { grid-template-columns: 8px minmax(0, 1fr) 32px; }
	.small-item[data-has-accent="true"][data-has-meta="false"] { grid-template-columns: 8px 48px minmax(0, 1fr); }
	.small-item[data-has-accent="true"][data-has-value="false"][data-has-meta="false"] { grid-template-columns: 8px minmax(0, 1fr); }
	.small-item[data-has-accent="false"] { grid-template-columns: 48px minmax(0, 1fr) 32px; }
	.small-item[data-has-accent="false"][data-has-value="false"] { grid-template-columns: minmax(0, 1fr) 32px; }
	.small-item[data-has-accent="false"][data-has-meta="false"] { grid-template-columns: 48px minmax(0, 1fr); }
	.small-item[data-has-accent="false"][data-has-value="false"][data-has-meta="false"] { grid-template-columns: minmax(0, 1fr); }
</style>
