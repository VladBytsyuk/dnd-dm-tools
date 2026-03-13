<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullItem } from 'src/domain/models/items/FullItem';
	import { copyEquipmentToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import { separate } from 'src/domain/utils/utils';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiPropertyGrid, { type UiPropertyGridItem } from '../uikit/molecules/UiPropertyGrid.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

    interface Props {
        currentItem: FullItem,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    useDiceRollers(uiEventListener);

    let properties: UiPropertyGridItem[] = $derived([
        { label: 'Стоимость', value: currentItem.price },
        { label: 'Вес', value: currentItem.weight ? `${currentItem.weight} фун.` : undefined },
    ]);
</script>

<UiDetailCard>
    <UiDetailHeader
        name={currentItem.name}
        type={separate(currentItem.categories)}
        source={currentItem.source}
        onCopy={() => copyEquipmentToClipboard(currentItem)}
    />
    <UiPropertyGrid items={properties} {uiEventListener} />
    {#if currentItem.description}
        <UiContentSection>
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </UiContentSection>
    {/if}
</UiDetailCard>
