<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import { copyArmorToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import type { FullArmor } from 'src/domain/models/armor/FullArmor';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiPropertyGrid, { type UiPropertyGridItem } from '../uikit/molecules/UiPropertyGrid.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

    interface Props {
        currentItem: FullArmor,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    useDiceRollers(uiEventListener);

    const properties: UiPropertyGridItem[] = [
        { label: 'Класс брони (AC)', value: currentItem.armorClass },
        { label: 'Стоимость', value: currentItem.price },
        { label: 'Вес', value: currentItem.weight ? `${currentItem.weight} фун.` : undefined },
        { label: 'Помеха на Скрытность', value: currentItem.disadvantage ? 'Есть' : 'Нет' },
        { label: 'Требование к Силе', value: currentItem.requirement ? 'Есть' : 'Нет' },
        { label: 'Надевание / Снятие', value: currentItem.duration },
    ];
</script>

<UiDetailCard>
    <UiDetailHeader 
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onCopy={() => copyArmorToClipboard(currentItem)}
    />
    <UiPropertyGrid items={properties} {uiEventListener} />
    {#if currentItem.description}
        <UiContentSection>
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </UiContentSection>
    {/if}
</UiDetailCard>
