<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
	import { copyWeaponToClipboard } from 'src/data/clipboard';
	import { joinProperties } from 'src/domain/utils/utils';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiPropertyGrid, { type UiPropertyGridItem } from '../uikit/molecules/UiPropertyGrid.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

    interface Props {
        currentItem: FullWeapon,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    useDiceRollers(uiEventListener);

    let properties: UiPropertyGridItem[] = $derived([
        { label: 'Стоимость', value: currentItem.price },
        { label: 'Урон', value: currentItem.damage ? undefined : undefined, html: currentItem.damage ? `${currentItem.damage.dice ? `<dice-roller label="Урон (${currentItem.damage.type})" formula="${currentItem.damage.dice}"></dice-roller> ` : ''}${currentItem.damage.type}` : undefined },
        { label: 'Вес', value: currentItem.weight ? `${currentItem.weight} фун.` : undefined },
        { label: 'Свойства', html: currentItem.properties ? joinProperties(currentItem.properties) : undefined },
    ]);
</script>

<UiDetailCard>
    <UiDetailHeader
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onCopy={() => copyWeaponToClipboard(currentItem)}
    />
    <UiPropertyGrid items={properties} {uiEventListener} />
    {#if currentItem.description}
        <UiContentSection>
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </UiContentSection>
    {/if}
    {#if currentItem.special}
        <UiContentSection title="Особое свойство:">
            <HtmlBlock htmlContent={currentItem.special} uiEventListener={uiEventListener} />
        </UiContentSection>
    {/if}
</UiDetailCard>
