<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullBackground } from 'src/domain/models/background/FullBackground';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiPropertyGrid, { type UiPropertyGridItem } from '../uikit/molecules/UiPropertyGrid.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

	interface Props {
		currentItem: FullBackground,
		uiEventListener: IUiEventListener,
	}
	let { currentItem, uiEventListener }: Props = $props();

	useDiceRollers(() => uiEventListener);

	const listHtml = (items: string[]) => items.length > 0
		? `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
		: undefined;

	let properties: UiPropertyGridItem[] = $derived([
		{ label: 'Навыки', value: currentItem.skills.length > 0 ? currentItem.skills.join(', ') : undefined },
		{ label: 'Инструменты', html: currentItem.toolOwnership || undefined },
		{ label: 'Языки', value: currentItem.language || undefined },
		{ label: 'Снаряжение', html: listHtml(currentItem.equipments) },
		{ label: 'Стартовое золото', value: currentItem.startGold ? `${currentItem.startGold} зм.` : undefined },
	]);
	let descriptionHtml = $derived(currentItem.associatedHtml || currentItem.description);
</script>

<UiDetailCard className="full-item">
	<UiDetailHeader
		name={currentItem.name}
		entityLink={currentItem.url}
		source={currentItem.source}
	/>
	<UiPropertyGrid items={properties} {uiEventListener} />

	{#if descriptionHtml}
		<UiContentSection title={currentItem.description ? 'Описание' : undefined} className="background-details__content">
			<HtmlBlock htmlContent={descriptionHtml} uiEventListener={uiEventListener} />
		</UiContentSection>
	{/if}

	{#if currentItem.skillName || currentItem.skillDescription}
		<UiContentSection title={currentItem.skillName || 'Особенность'} className="background-details__content">
			{#if currentItem.skillDescription}
				<HtmlBlock htmlContent={currentItem.skillDescription} {uiEventListener} />
			{/if}
		</UiContentSection>
	{/if}

	{#if currentItem.personalization}
		<UiContentSection title="Персонализация" className="background-details__content">
			<HtmlBlock htmlContent={currentItem.personalization} uiEventListener={uiEventListener} />
		</UiContentSection>
	{/if}

	{#each currentItem.personalizationTables ?? [] as table}
		<UiContentSection title={table.name} className="background-details__content">
			<div class="background-table-scroll">
				<table class="background-table">
					<thead>
						<tr>
							<th scope="col"><dice-roller label={table.name} formula={table.formula}>{table.formula}</dice-roller></th>
							<th scope="col">{table.thead[0] || table.name}</th>
						</tr>
					</thead>
					<tbody>
						{#each table.tbody as row}
							<tr>
								<td>{row[0]}</td>
								<td><HtmlBlock htmlContent={row[1] || ''} {uiEventListener} /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</UiContentSection>
	{/each}
</UiDetailCard>

<style>
	.background-table-scroll {
		overflow-x: auto;
		border-radius: var(--dnd-ui-radius-lg);
	}

	.background-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.background-table th,
	.background-table td {
		padding: var(--dnd-ui-space-4) var(--dnd-ui-space-8);
		vertical-align: top;
	}

	.background-table th {
		background: var(--dnd-ui-pattern-meta-bg);
		font-weight: var(--dnd-ui-font-weight-semibold);
	}

	.background-table tbody tr:nth-child(even) {
		background: var(--dnd-ui-pattern-subtle-bg);
	}

	.background-table td:first-child,
	.background-table th:first-child {
		width: 2.5em;
		text-align: center;
		white-space: nowrap;
	}
</style>
