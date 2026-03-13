<script lang="ts">
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
	import type { FullBackground } from 'src/domain/models/background/FullBackground';
	import { copyBackgroundToClipboard } from 'src/data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';
	import { useDiceRollers } from '../dice-roller/useDiceRollers';

    interface Props {
        currentItem: FullBackground,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    useDiceRollers(uiEventListener);
</script>

<UiDetailCard className="full-item">
    <UiDetailHeader
        name={currentItem.name}
        source={currentItem.source}
        onCopy={() => copyBackgroundToClipboard(currentItem)}
    />

    <UiContentSection className="background-details__content">
        <HtmlBlock htmlContent={currentItem.associatedHtml} uiEventListener={uiEventListener} />      
    </UiContentSection>
</UiDetailCard>
