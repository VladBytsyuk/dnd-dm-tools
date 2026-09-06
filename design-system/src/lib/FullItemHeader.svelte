<script lang="ts">
	import "@fontsource/golos-text/400.css";
	import "@fontsource/golos-text/700.css";

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
		entityLink: string;
		badge?: string | number;
		info?: string;
		source?: FullItemSource;
		onCopy?: (text: string) => void;
		editable?: boolean;
	};

	let {
		russianName = $bindable(""),
		englishName = $bindable(""),
		entityLink = $bindable(""),
		badge = $bindable(),
		info = $bindable(),
		source = $bindable(),
		onCopy,
		editable = false,
	}: Props = $props();

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
</script>

<header class="full-item-header">
	<div class="names">
		{#if editable}
			<input class="name russian-name" bind:value={russianName} aria-label="Русское название" />
			<input class="name english-name" bind:value={englishName} aria-label="Английское название" />
			<input class="entity-link" bind:value={entityLink} aria-label="Ссылка на сущность" />
		{:else}
			<button type="button" class="name russian-name" onclick={() => copy(russianName)} aria-label={`Скопировать: ${russianName}`}>
				{russianName}
			</button>
			<button type="button" class="name english-name" onclick={() => copy(englishName)} aria-label={`Скопировать: ${englishName}`}>
				{englishName}
			</button>
			<button type="button" class="entity-link" onclick={() => copy(entityLink)} aria-label={`Скопировать ссылку: ${entityLink}`}>
				{entityLink}
			</button>
		{/if}
	</div>

	{#if badge !== undefined || info || source}
		<div class="details">
			{#if badge !== undefined}
				{#if editable}
					<input class="badge" bind:value={badge} aria-label="Номер или уровень" />
				{:else}
					<span class="badge">{badge}</span>
				{/if}
			{/if}
			{#if info}
				{#if editable}
					<input class="info" bind:value={info} aria-label="Описание" />
				{:else}
					<span class="info">{info}</span>
				{/if}
			{/if}
			{#if source}
				{#if editable}
					<input class="source" bind:value={source.shortName} aria-label="Краткое название источника" />
				{:else}
					<span class="source-wrapper">
						<button type="button" class="source" aria-describedby="source-tooltip">{source.shortName}</button>
						<span id="source-tooltip" role="tooltip" class="source-tooltip">
							<strong>{source.name}</strong>
							<span>{source.group.name}{source.homebrew ? " · Homebrew" : ""}</span>
						</span>
					</span>
				{/if}
			{/if}
		</div>
	{/if}
</header>

<style>
	.full-item-header {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		width: 100%;
		min-width: 0;
		min-height: 45px;
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.names, .details { display: flex; flex-direction: column; min-width: 0; }
	.names { flex: 1 1 auto; gap: 2px; }
	.details { flex: 0 1 auto; align-items: end; justify-content: space-between; text-align: right; }
	.name, .entity-link, .source {
		max-width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font-family: inherit;
		text-align: inherit;
		cursor: pointer;
	}
	.full-item-header input {
		box-sizing: border-box;
		width: 100%;
		padding: 0;
		border: 0;
		border-radius: 0;
		appearance: none;
		background: transparent;
		color: inherit;
		font-family: inherit;
		text-align: inherit;
		cursor: text;
	}
	.name, .entity-link { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
	.russian-name { font-size: 16px; font-weight: 700; line-height: 19px; }
	.english-name, .info { font-size: 10px; font-weight: 400; line-height: 12px; }
	.entity-link, .source { color: rgb(255 255 255 / 70%); font-size: 8px; font-weight: 400; line-height: 10px; }
	.badge { font-size: 16px; font-weight: 700; line-height: 19px; }
	button.name:hover, button.entity-link:hover, .source:hover { text-decoration: underline; }
	button.name:focus-visible, button.entity-link:focus-visible, .source:focus-visible, input.name:focus-visible, input.entity-link:focus-visible, input.badge:focus-visible, input.info:focus-visible { outline: 2px solid currentcolor; outline-offset: 2px; }
	.source-wrapper { position: relative; display: inline-flex; }
	.source-tooltip {
		position: absolute;
		right: 0;
		bottom: calc(100% + 6px);
		z-index: 1;
		display: grid;
		gap: 2px;
		width: max-content;
		max-width: 240px;
		padding: 6px 8px;
		border-radius: 4px;
		background: #18181b;
		box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
		color: #fff;
		font-size: 10px;
		line-height: 12px;
		text-align: left;
		opacity: 0;
		pointer-events: none;
		transform: translateY(2px);
		transition: opacity 120ms ease, transform 120ms ease;
	}
	.source-tooltip span { color: rgb(255 255 255 / 70%); }
	.source-wrapper:hover .source-tooltip, .source:focus-visible + .source-tooltip { opacity: 1; transform: translateY(0); }
</style>
