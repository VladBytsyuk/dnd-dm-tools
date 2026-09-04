<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import type { SvelteHTMLElements } from "svelte/elements";
	import UserCog from "lucide-svelte/icons/user-cog";

	type Icon = typeof UserCog;

	type Props = SvelteHTMLElements["article"] & {
		accentColor?: string;
		primaryColor?: string;
		secondaryColor?: string;
		value?: string | number;
		title?: string;
		subtitle?: string;
		description?: string;
		source?: string;
		secondarySource?: string;
		icon?: Icon;
		state?: "default" | "hovered" | "clicked";
	};

	let {
		accentColor = "#ff0000",
		primaryColor = "#303030",
		secondaryColor = "#303030",
		value,
		title,
		subtitle,
		description,
		source,
		secondarySource,
		icon: Icon,
		state = "default",
		...articleProps
	}: Props = $props();
</script>

<article
	{...articleProps}
	class="small-item"
	data-state={state}
	data-has-value={value !== undefined}
	data-has-meta={Boolean(source || secondarySource || Icon)}
	style={`--accent-color: ${accentColor}; --primary-color: ${primaryColor}; --secondary-color: ${secondaryColor}`}
>
	<div class="accent" aria-hidden="true"></div>
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
		height: 64px;
		overflow: hidden;
		border: 0;
		border-radius: 8px;
		background: linear-gradient(105deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		box-shadow: 0 2px 2px rgb(0 0 0 / 25%);
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.small-item:hover, .small-item[data-state="hovered"] { box-shadow: 0 6px 6px rgb(0 0 0 / 25%); }
	.small-item:active, .small-item[data-state="clicked"] { box-shadow: 0 1px 1px rgb(0 0 0 / 25%); }
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
	.small-item[data-has-value="false"] { grid-template-columns: 8px minmax(0, 1fr) 32px; }
	.small-item[data-has-meta="false"] { grid-template-columns: 8px 48px minmax(0, 1fr); }
	.small-item[data-has-value="false"][data-has-meta="false"] { grid-template-columns: 8px minmax(0, 1fr); }
</style>
