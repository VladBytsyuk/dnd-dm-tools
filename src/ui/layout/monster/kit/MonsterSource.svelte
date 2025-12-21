<script lang="ts">
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';

    let { currentItem } = $props<{ currentItem: FullMonster; }>();
</script>
  
<div class="header-block">
    {#if currentItem.size || currentItem.type || currentItem.alignment}
    <div class="header-subtitle">
        {[currentItem.size?.rus, currentItem.type?.name].filter(Boolean).join(' ')}
        {currentItem.alignment ? `, ${currentItem.alignment}` : ''}
        {currentItem.size?.eng || currentItem.size?.cell ? '/ ' : ''}
        {currentItem.size?.eng ? currentItem.size.eng: ' '}
        {currentItem.size?.cell ? currentItem.size.cell: ''}
    </div>
    {/if}
    {#if currentItem.source}
    <div class="header-source">
        Источник: {currentItem.source.name} ({currentItem.source.shortName})
    </div>
    {/if}
</div>
					
<style>
    .header-block { 
        background: var(--accent-bg);
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 6px 0px 12px;
        justify-content: space-between;
        padding: 8px;
        border-radius: 6px;
    }

    .header-subtitle {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        line-height: 1.2em;
    }

    .header-source {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-size: 12px;
    }
</style>
