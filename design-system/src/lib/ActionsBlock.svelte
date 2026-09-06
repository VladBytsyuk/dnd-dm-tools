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
	};

	let {
		title,
		description,
		blocks = [],
		accentColor = "#d4d4d4",
		blocksExpanded = true,
	}: Props = $props();

	let blockBackground = $derived(`color-mix(in srgb, ${accentColor} 40%, transparent)`);
	let columns = $derived.by(() => {
		const result: [ActionsBlockItem[], ActionsBlockItem[]] = [[], []];

		blocks.forEach((block, index) => result[index % 2].push(block));

		return result;
	});
</script>

<section class="actions-block">
	{#if title}
		<h2>{title}</h2>
	{/if}

	{#if description}
		<p class="description">{description}</p>
	{/if}

	{#if blocks.length}
		<div class="blocks">
			{#each columns as column}
				<div class="column">
					{#each column as block}
						<FilledTextBlock
							title={block.title}
							text={block.text}
							icon={block.title ? ChevronRight : undefined}
							expanded={blocksExpanded}
							background={blockBackground}
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
