<script lang="ts">
    import type { FullFeat } from '../../../../domain/models/feat/FullFeat';
    import type { IUiEventListener } from '../../../../domain/listeners/ui_event_listener';
    import FeatName from './kit/FeatName.svelte';
    import FeatSource from './kit/FeatSource.svelte';
    import FeatRequirements from './kit/FeatRequirements.svelte';
    import FeatDescription from './kit/FeatDescription.svelte';

    let { 
		currentItem, 
		uiEventListener,
	} = $props<{
        currentItem: FullFeat;
        uiEventListener: IUiEventListener;
    }>();
</script>
  
<div class="feat-root">
    <div class="statblock">
        <div class="section-horizontal">
            <div class="section-horizontal-header">
                <div class="header">
                    <div class="header-left">
                        <FeatName {currentItem} isInEditMode={false} {uiEventListener} />
                    </div>
                    <div class="header-right">
                        <FeatSource {currentItem} isInEditMode={false} />
                    </div>
                </div>
            </div>
        </div>

        <FeatRequirements {currentItem} isInEditMode={false} />
        <FeatDescription {currentItem} isInEditMode={false} />
    </div>
</div>

<style>
    .feat-root {
        display: inline-block;
        position: relative;
        overflow: visible;
        background: #00000020;
        border-radius: 8px;
        border-color: #00000090;
        border-width: 2px;
        color: var(--text-color);
    }

    .statblock {
        text-align: left;
        font-size: 12.5px;
        line-height: 1.2em;
        display: inline-block;
        vertical-align: top;
        width: 100%;
        background-size: cover;
        background-position: center;
        padding: 1em;
        box-sizing: border-box;
        font-family: "Open Sans", sans-serif;
        background: var(--bg-color);
        color: var(--text-color);
    }

    .header {
        margin: 0 0 0.5em;
		display: flex;
		align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .header-left {
        min-width: 0; 
        flex: 1 1 auto;
        flex-grow: 1;
    }

    .header-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex: 0 0 auto;
    }

    .section-horizontal {
        display: flex;
    }

    .section-horizontal-header {
        flex: 1;
    }
</style>
