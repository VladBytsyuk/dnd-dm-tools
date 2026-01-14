<script lang="ts">
	import type { Source } from '../../../../domain/models/common/Source';

    let { currentItem, isInEditMode } = $props<{
        currentItem: { source: Source };
        isInEditMode: boolean;
    }>();
</script>

<div class="source">
    <span>{currentItem.source.name}</span>
    <span>({currentItem.source.shortName})</span>
</div>

<style>
    .source {
        font-size: 0.8em;
        font-style: italic;
    }
</style>
