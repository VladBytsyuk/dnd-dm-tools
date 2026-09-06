<script module lang="ts">
	export type ActionsBlockItem = {
		title?: string;
		text?: string;
	};
</script>

<script lang="ts">
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import FilledTextBlock from "./FilledTextBlock.svelte";

	type Props = {
		title?: string;
		description?: string;
		blocks?: ActionsBlockItem[];
		accentColor?: string;
		blocksExpanded?: boolean;
		editable?: boolean;
	};

	let {
		title = $bindable(""),
		description = $bindable(""),
		blocks = $bindable<ActionsBlockItem[]>([]),
		accentColor = "#d4d4d4",
		blocksExpanded = true,
		editable = false,
	}: Props = $props();

	let blockBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);
	let columns = $derived.by(() => {
		const result: [ActionsBlockItem[], ActionsBlockItem[]] = [[], []];

		blocks.forEach((block, index) => result[index % 2].push(block));

		return result;
	});
</script>

<section class="actions-block">
	{#if title || editable}
		{#if editable}
			<input class="title-input" bind:value={title} aria-label="Заголовок блока действий" />
		{:else}
			<h2>{title}</h2>
		{/if}
	{/if}

	{#if description || editable}
		{#if editable}
			<textarea
				class="description-input"
				bind:value={description}
				aria-label="Описание блока действий"
				rows="2"
			></textarea>
		{:else}
			<p class="description">{description}</p>
		{/if}
	{/if}

	{#if blocks.length}
		<div class="blocks">
			{#each columns as column}
				<div class="column">
					{#each column as block}
						<FilledTextBlock
							bind:title={block.title}
							bind:text={block.text}
							icon={block.title ? ChevronRight : undefined}
							expanded={blocksExpanded}
							background={blockBackground}
							{editable}
						/>
					{/each}
				</div>
			{/each}
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

	h2,
	p {
		margin: 0;
	}

	h2 {
		font-size: 16px;
		font-weight: 700;
		line-height: 19px;
	}

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

	.title-input {
		font-size: 16px;
		font-weight: 700;
		line-height: 19px;
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

	.title-input:focus-visible,
	.description-input:focus-visible {
		outline: 1px solid color-mix(in srgb, #fff 70%, transparent);
		outline-offset: 2px;
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
</style>
