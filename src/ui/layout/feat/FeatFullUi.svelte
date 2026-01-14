<script lang="ts">
    import FeatRequirements from './kit/FeatRequirements.svelte';
    import FeatDescription from './kit/FeatDescription.svelte';
	import type { FullFeat } from '../../../domain/models/feat/FullFeat';
	import type { IUiEventListener } from '../../../domain/listeners/ui_event_listener';
	import HeaderFullUi from '../uikit/HeaderFullUi.svelte';
	import { copyFeatToClipboard } from '../../../data/clipboard';
	import HtmlBlock from '../uikit/HtmlBlock.svelte';

    let { 
		currentItem, 
		uiEventListener,
	} = $props<{
        currentItem: FullFeat;
        uiEventListener: IUiEventListener;
    }>();
</script>
  
<div class="full-item">
    <HeaderFullUi
        name={currentItem.name}
        source={currentItem.source}
        onClick={() => copyFeatToClipboard(currentItem)}
    />

    <FeatRequirements {currentItem} isInEditMode={false} />


    <div class="background-details__content">
        <HtmlBlock htmlContent={currentItem.description} uiEventListener={uiEventListener} />      
    </div>
</div>
