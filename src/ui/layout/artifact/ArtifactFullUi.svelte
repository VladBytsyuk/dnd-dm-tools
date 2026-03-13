<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullArtifact } from 'src/domain/models/artifact/FullArtifact';
	import { copyArtifactToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiPropertyGrid, { type UiPropertyGridItem } from '../uikit/molecules/UiPropertyGrid.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

    interface Props {
        currentItem: FullArtifact,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    useDiceRollers(uiEventListener);

    const properties: UiPropertyGridItem[] = [
        { label: 'Настройка', value: currentItem.customization ? 'Требуется' : 'Не требуется' },
        { label: 'Стоимость DMG', value: currentItem.cost?.dmg ?? undefined },
        { label: 'Стоимость XGE', value: currentItem.cost?.xge ?? undefined },
    ];
</script>

<UiDetailCard>
    <UiDetailHeader
        images={currentItem.images}
        name={currentItem.name}
        type={currentItem.type.name}
        source={currentItem.source}
        onCopy={() => copyArtifactToClipboard(currentItem)}
        uiEventListener={uiEventListener}
    />
    <UiPropertyGrid items={properties} {uiEventListener} />
    {#if currentItem.description}
        <UiContentSection>
            <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />
        </UiContentSection>
    {/if}
</UiDetailCard>
