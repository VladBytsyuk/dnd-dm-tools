<script lang="ts">
	import type { FullMonster } from '../../../../domain/models/monster/FullMonster';

    let { 
        currentItem,
        isInEditMode
    } = $props<{
        currentItem: FullMonster;
        isInEditMode: boolean;
    }>();
</script>
  
<div class="header-block">
    {#if currentItem.size || currentItem.type || currentItem.alignment}
        <div class="header-block-column">
            <div class="header-block-line">
                <input class="header-subtitle inputlike"
                    class:inputlike-editable={isInEditMode}
                    bind:value={currentItem.size.rus} 
                    readonly={!isInEditMode}
                    />
                <input class="header-subtitle inputlike"
                    class:inputlike-editable={isInEditMode}
                    bind:value={currentItem.type.name} 
                    readonly={!isInEditMode}
                    />
            </div>

            <div class="header-block-line">
                <input class="header-subtitle inputlike"
                    class:inputlike-editable={isInEditMode}
                    bind:value={currentItem.alignment} 
                    readonly={!isInEditMode}
                    />
                <input class="header-subtitle inputlike"
                    class:inputlike-editable={isInEditMode}
                    bind:value={currentItem.size.cell} 
                    readonly={!isInEditMode}
                    />
            </div>
        </div>
    {/if}
    {#if currentItem.source}
        <div class="header-block-line">
            <input class="header-source inputlike"
                class:inputlike-editable={isInEditMode}
                bind:value={currentItem.source.name} 
                readonly={!isInEditMode}
                />
            <input class="header-source inputlike"
                class:inputlike-editable={isInEditMode}
                bind:value={currentItem.source.shortName} 
                readonly={!isInEditMode}
                />
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
        max-width: 240px;
    }

    .header-block-column {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-content: start;
        gap: 2px;
    }

    .header-block-line {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-content: start;
        align-items: flex-start;
    }

    .header-subtitle {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-style: italic;
        font-size: 12px;
        line-height: 1.2em;
        flex-grow: 1;
    }

    .header-source {
        font-family: "Open Sans", sans-serif;  
        color: var(--text-color);
        opacity: 0.75;
        font-weight: normal;
        font-size: 12px;
    }

	.inputlike {
        flex: 1 1 auto;
	    min-width: 0;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
	}

	.inputlike-editable {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        text-overflow: ellipsis;
	}
</style>
