<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";
	import type { Snippet } from "svelte";

	export type FullItemSource = {
		shortName: string;
		name: string;
		group: {
			shortName: string;
			name: string;
		};
		homebrew?: boolean;
	};

	type Props = {
		russianName: string;
		englishName: string;
		showEnglishName?: boolean;
		entityLink: string;
		badge?: string | number;
		badgeInputType?: "text" | "number";
		info?: string;
		infoContent?: Snippet;
		actions?: Snippet;
		source?: FullItemSource;
		sourceSuffix?: string;
		wrapRussianName?: boolean;
		onCopy?: (text: string) => void;
		onInfoChange?: (info: string) => void;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		russianName = $bindable(""),
		englishName = $bindable(""),
		showEnglishName = true,
		entityLink = $bindable(""),
		badge = $bindable(),
		badgeInputType = "text",
		info = $bindable(),
		infoContent,
		actions,
		source = $bindable(),
		sourceSuffix = "",
		wrapRussianName = false,
		onCopy,
		onInfoChange,
		editable = false,
		theme = "dark",
	}: Props = $props();

	function handleInfoInput(event: Event) {
		onInfoChange?.((event.currentTarget as HTMLInputElement).value);
	}

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.readOnly = true;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.append(textarea);
			textarea.select();
			document.execCommand("copy");
			textarea.remove();
		}

		onCopy?.(text);
	}

	async function copyName(name: string) {
		await copy(name);
	}

	function copyEntityLink() {
		const pluginLink = entityLink.startsWith("dnd:") ? entityLink : `dnd:${entityLink}`;
		void copy(`[${escapeMarkdownLinkLabel(russianName)}](${pluginLink})`);
	}

	function escapeMarkdownLinkLabel(value: string): string {
		return value.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
	}
</script>

<header class="full-item-header" data-theme={theme} data-wrap-russian-name={wrapRussianName}>
	<div class="names">
		{#if editable}
			<input class="name russian-name" bind:value={russianName} placeholder="Русское название" aria-label="Русское название" />
			{#if showEnglishName}<input class="name english-name" bind:value={englishName} placeholder="English name" aria-label="Английское название" />{/if}
			<input class="entity-link" bind:value={entityLink} placeholder="/bestiary/slug" aria-label="Ссылка на сущность" />
		{:else}
			<button type="button" class="name russian-name" onclick={() => copyName(russianName)} aria-label={`Скопировать: ${russianName}`}>
				{russianName}
			</button>
			{#if showEnglishName}
				<button type="button" class="name english-name" onclick={() => copyName(englishName)} aria-label={`Скопировать: ${englishName}`}>
					{englishName}
				</button>
			{/if}
			<button type="button" class="entity-link" onclick={copyEntityLink} aria-label={`Скопировать ссылку: dnd:${entityLink}`}>
				{entityLink}
			</button>
		{/if}
	</div>

	{#if badge !== undefined || (editable && info !== undefined) || info || infoContent || source}
		<div class="details">
			{#if badge !== undefined}
				{#if editable}
					<input class="badge" type={badgeInputType} min={badgeInputType === "number" ? 0 : undefined} max={badgeInputType === "number" ? 9 : undefined} bind:value={badge} placeholder="Уровень" aria-label="Номер или уровень" />
				{:else}
					<span class="badge">{badge}</span>
				{/if}
			{/if}
			{#if infoContent}
				{@render infoContent()}
			{:else if (editable && info !== undefined) || info}
				{#if editable}
					<input class="info" bind:value={info} oninput={handleInfoInput} placeholder="Тип или категория" aria-label="Описание" />
				{:else}
					<span class="info">{info}</span>
				{/if}
			{/if}
			{#if source && (editable || source.shortName)}
				{#if editable}
					<span class="source-edit">
						<input class="source" bind:value={source.shortName} placeholder="PHB" aria-label="Краткое название источника" />
						{#if sourceSuffix}<span aria-hidden="true">{sourceSuffix}</span>{/if}
					</span>
				{:else}
					<span class="source-wrapper">
						<button type="button" class="source" aria-describedby="source-tooltip">{source.shortName}{sourceSuffix}</button>
						<span id="source-tooltip" role="tooltip" class="source-tooltip">
							<strong>{source.name}</strong>
							<span>{source.group.name}{source.homebrew ? " · Homebrew" : ""}</span>
						</span>
					</span>
				{/if}
			{/if}
		</div>
	{/if}
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.full-item-header {
		display: flex;
		justify-content: space-between;
		gap: calc(16 * var(--ds-media-unit, 1px));
		width: 100%;
		min-width: 0;
		min-height: calc(45 * var(--ds-media-unit, 1px));
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.names, .details { display: flex; flex-direction: column; min-width: 0; }
	.names { flex: 1 1 auto; gap: calc(2 * var(--ds-media-unit, 1px)); }
	.details { flex: 0 1 auto; align-items: end; justify-content: space-between; text-align: right; }
	.actions { display: flex; flex: 0 0 auto; align-items: start; gap: calc(4 * var(--ds-media-unit, 1px)); }
	.source-edit { display: inline-flex; align-items: baseline; min-width: 0; }
	.source-edit input { min-width: 0; }
	.name, .entity-link, .source {
		all: unset;
		box-sizing: border-box;
		display: block;
		max-width: 100%;
		color: inherit;
		font-family: inherit;
		text-align: inherit;
		cursor: pointer;
	}
	.full-item-header button.name,
	.full-item-header button.entity-link,
	.full-item-header button.source {
		appearance: none;
		border: 0;
		border-radius: 0;
		box-shadow: none;
		background: transparent;
		padding: 0;
	}
	.full-item-header .names input,
	.full-item-header .details input {
		all: unset;
		box-sizing: border-box;
		display: block;
		width: 100%;
		color: inherit;
		font-family: inherit;
		text-align: inherit;
		cursor: text;
	}
	.full-item-header input::placeholder { color: currentcolor; opacity: 0.65; }
	.name, .entity-link { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
	.full-item-header[data-wrap-russian-name="true"] .russian-name {
		overflow: visible;
		text-overflow: clip;
		white-space: normal;
	}
	.russian-name { font-size: calc(24 * var(--ds-media-unit, 1px)); font-weight: 700; line-height: calc(28.5 * var(--ds-media-unit, 1px)); }
	.english-name, .info { font-size: calc(15 * var(--ds-media-unit, 1px)); font-weight: 400; line-height: calc(18 * var(--ds-media-unit, 1px)); }
	.entity-link, .source { color: rgb(255 255 255 / 70%); font-size: calc(12 * var(--ds-media-unit, 1px)); font-weight: 400; line-height: calc(15 * var(--ds-media-unit, 1px)); }
	.full-item-header[data-theme="light"] { color: #1f2937; }
	.full-item-header[data-theme="light"] .entity-link, .full-item-header[data-theme="light"] .source { color: rgb(31 41 55 / 70%); }
	.badge { font-size: calc(24 * var(--ds-media-unit, 1px)); font-weight: 700; line-height: calc(28.5 * var(--ds-media-unit, 1px)); }
	button.name:hover, button.entity-link:hover, .source:hover { text-decoration: underline; }
	button.name:focus-visible, button.entity-link:focus-visible, .source:focus-visible, input.name:focus-visible, input.entity-link:focus-visible, input.badge:focus-visible, input.info:focus-visible { outline: calc(2 * var(--ds-media-unit, 1px)) solid currentcolor; outline-offset: calc(2 * var(--ds-media-unit, 1px)); }
	.source-wrapper { position: relative; display: inline-flex; }
	.source-tooltip {
		position: absolute;
		right: 0;
		bottom: calc(100% + calc(6 * var(--ds-media-unit, 1px)));
		z-index: 1;
		display: grid;
		gap: calc(2 * var(--ds-media-unit, 1px));
		width: max-content;
		max-width: calc(240 * var(--ds-media-unit, 1px));
		padding: calc(6 * var(--ds-media-unit, 1px)) calc(8 * var(--ds-media-unit, 1px));
		border-radius: calc(4 * var(--ds-media-unit, 1px));
		background: #18181b;
		box-shadow: 0 calc(2 * var(--ds-media-unit, 1px)) calc(6 * var(--ds-media-unit, 1px)) rgb(0 0 0 / 25%);
		color: #fff;
		font-size: calc(15 * var(--ds-media-unit, 1px));
		line-height: calc(18 * var(--ds-media-unit, 1px));
		text-align: left;
		opacity: 0;
		pointer-events: none;
		transform: translateY(calc(2 * var(--ds-media-unit, 1px)));
		transition: opacity 120ms ease, transform 120ms ease;
	}
	.source-tooltip span { color: rgb(255 255 255 / 70%); }
	.source-wrapper:hover .source-tooltip, .source:focus-visible + .source-tooltip { opacity: 1; transform: translateY(0); }
</style>
