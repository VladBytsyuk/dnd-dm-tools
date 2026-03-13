<script lang="ts">
    import FeatRequirements from './kit/FeatRequirements.svelte';
    import FeatDescription from './kit/FeatDescription.svelte';
	import type { FullFeat } from '../../../domain/models/feat/FullFeat';
	import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
	import { copyFeatToClipboard } from '../../../data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';
	import UiDetailCard from '../uikit/organisms/UiDetailCard.svelte';
	import UiDetailHeader from '../uikit/organisms/UiDetailHeader.svelte';
	import UiContentSection from '../uikit/molecules/UiContentSection.svelte';

    let { 
		currentItem, 
		uiEventListener,
	} = $props<{
        currentItem: FullFeat;
        uiEventListener: IUiEventListener;
    }>();
</script>
  
<UiDetailCard className="full-item">
    <UiDetailHeader
        name={currentItem.name}
        source={currentItem.source}
        onCopy={() => copyFeatToClipboard(currentItem)}
    />

    <FeatRequirements {currentItem} isInEditMode={false} />


    <UiContentSection className="background-details__content">
        <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />      
    </UiContentSection>
</UiDetailCard>
