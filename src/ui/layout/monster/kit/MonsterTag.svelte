<script lang="ts">
	import HtmlBlock from '../../uikit/HtmlBlock.svelte';
	import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener';

    let { 
		name,
        description,
		uiEventListener,
	} = $props<{
        name: string;
        description: string;
        uiEventListener: IUiEventListener;
    }>();
</script>
  
<details class="generic-block">
    <summary class="block-header">{name}</summary>
    <div class="generic-description">
        <HtmlBlock htmlContent={description} uiEventListener={uiEventListener} />
    </div>
</details>

<style>
    .block-header {
        border-bottom: 1px solid;
        border-bottom-color: var(--text-color);
        color: var(--text-color);
        font-size: 16px;
        margin: 0.5em 0 0.5em;
        padding: 0 0 8px;
    }

    .generic-block {
        padding: 0.5em;
        color: var(--text-color);
        margin: 0.5em;
        background: var(--accent-bg);
        border-radius: 8px;
        cursor: pointer;
    }

    .generic-description {
        margin: 0.5em 0 0.125em;
    }
</style>
