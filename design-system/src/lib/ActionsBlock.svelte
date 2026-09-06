<script module lang="ts">
	export type ActionsBlockItem = {
		title?: string;
		text?: string;
		html?: string;
	};
</script>

<script lang="ts">
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import Plus from "lucide-svelte/icons/plus";
	import Chip from "./Chip.svelte";
	import FilledTextBlock from "./FilledTextBlock.svelte";
	import TextBlock from "./TextBlock.svelte";

	type Props = {
		title?: string;
		description?: string;
		descriptionHtml?: string;
		blocks?: ActionsBlockItem[];
		accentColor?: string;
		blocksExpanded?: boolean;
		sectionExpanded?: boolean;
		onSpellLinkClick?: (link: { href: string; label: string }) => void | Promise<void>;
		editable?: boolean;
		theme?: "dark" | "light";
	};

	let {
		title = $bindable(""),
		description = $bindable(""),
		descriptionHtml,
		blocks = $bindable<ActionsBlockItem[]>([]),
		accentColor = "#d4d4d4",
		blocksExpanded = true,
		sectionExpanded = true,
		onSpellLinkClick,
		editable = false,
		theme = "dark",
	}: Props = $props();

	function getInitialSectionExpanded() {
		return sectionExpanded;
	}

	let isSectionExpanded = $state(getInitialSectionExpanded());
	let blockBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);
	let isContentVisible = $derived(!title || isSectionExpanded || editable);
	let columns = $derived.by(() => {
		const result: [ActionsBlockItem[], ActionsBlockItem[]] = [[], []];

		blocks.forEach((block, index) => result[index % 2].push(block));

		return result;
	});
</script>

<section class="actions-block" data-theme={theme}>
	{#if title || editable}
		{#if editable}
			<input class="title-input" bind:value={title} aria-label="Заголовок блока действий" />
		{:else}
			<button type="button" class="section-toggle" aria-expanded={isSectionExpanded} onclick={() => (isSectionExpanded = !isSectionExpanded)}>
				{title}
			</button>
		{/if}
	{/if}

	{#if isContentVisible && (description || descriptionHtml || editable)}
		{#if editable}
			<textarea
				class="description-input"
				bind:value={description}
				aria-label="Описание блока действий"
				rows="2"
			></textarea>
		{:else if descriptionHtml !== undefined}
			<TextBlock html={descriptionHtml} {accentColor} {onSpellLinkClick} {theme} />
		{:else}
			<p class="description">{description}</p>
		{/if}
	{/if}

	{#if isContentVisible && blocks.length}
		<div class="blocks">
			{#each columns as column}
				<div class="column">
					{#each column as block}
						{#if editable}
							<FilledTextBlock
								bind:title={block.title}
								bind:text={block.text}
								html={block.html}
								icon={block.title ? ChevronRight : undefined}
								expanded={blocksExpanded}
								background={blockBackground}
								{accentColor}
								{onSpellLinkClick}
								{editable}
								{theme}
							/>
						{:else}
							<FilledTextBlock
								title={block.title}
								text={block.text}
								html={block.html}
								icon={block.title ? ChevronRight : undefined}
								expanded={blocksExpanded}
								background={blockBackground}
								{accentColor}
								{onSpellLinkClick}
								{theme}
							/>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	{/if}

	{#if editable}
		<div class="add-block-chip">
			<Chip icon={Plus} background={blockBackground} {theme} />
		</div>
	{/if}
</section>

<style>
	.actions-block {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		color: #fff;
		font-family: "Golos Text", sans-serif;
	}

	.actions-block[data-theme="light"] { color: #1f2937; }

	p { margin: 0; }

	.section-toggle,
	.title-input,
	.description-input {
		box-sizing: border-box;
		width: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		padding: 0;
	}

	.section-toggle,
	.title-input {
		font-size: 16px;
		font-weight: 700;
		line-height: 19px;
	}

	.section-toggle {
		text-align: left;
		cursor: pointer;
	}
	.section-toggle:hover { text-decoration: underline; }
	.section-toggle:focus-visible,
	.title-input:focus-visible,
	.description-input:focus-visible {
		outline: 2px solid currentcolor;
		outline-offset: 2px;
	}

	.description-input {
		display: block;
		min-height: 24px;
		margin-top: 4px;
		resize: vertical;
		font-size: 10px;
		font-weight: 400;
		line-height: 12px;
	}

	.description {
		margin-top: 4px;
		font-size: 10px;
		font-weight: 400;
		line-height: 12px;
	}

	.blocks {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.column {
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.add-block-chip {
		width: 100%;
		margin-top: 12px;
	}

	.add-block-chip :global(.chip) {
		width: 100%;
		justify-content: center;
	}

	@media (max-width: 280px) {
		.blocks { flex-direction: column; }
	}
</style>
