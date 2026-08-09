<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullBackground } from 'src/domain/models/background/FullBackground';
	import { copyBackgroundToClipboard } from 'src/data/clipboard';
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
		{ label: 'Снаряжение', html: listHtml(currentItem.equipments) },
		{ label: 'Стартовое золото', value: currentItem.startGold ? `${currentItem.startGold} зм.` : undefined },
	]);
</script>

<UiDetailCard className="full-item">
	<UiDetailHeader
		name={currentItem.name}
		source={currentItem.source}
		onCopy={() => copyBackgroundToClipboard(currentItem)}
	/>
	<UiPropertyGrid items={properties} {uiEventListener} />

	{#if currentItem.description}
		<UiContentSection className="background-details__content">
			<HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
		</UiContentSection>
	{/if}

	{#if currentItem.associatedHtml}
		<UiContentSection className="background-details__content">
			<HtmlBlock htmlContent={currentItem.associatedHtml} uiEventListener={uiEventListener} />
		</UiContentSection>
	{/if}

	{#if currentItem.personalization}
		<UiContentSection title="Персонализация" className="background-details__content">
			<HtmlBlock htmlContent={currentItem.personalization} uiEventListener={uiEventListener} />
		</UiContentSection>
	{/if}
</UiDetailCard>
