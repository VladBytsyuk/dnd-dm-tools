<script lang="ts">
	import { calculateAndFormatModifier } from 'src/domain/modifier';

    let { 
        title,
        value, 
        isInEditMode 
    } = $props<{ 
        title: string;
        value: number;
        isInEditMode: boolean;
    }>();
</script>
  

<div class="scores-table-item">
    <div class="scores-table-item-title"><b>{title}</b></div>
    <div class="scores-table-item-value">
        {#if isInEditMode}
            <input class="inputlike" bind:value={value} />
        {:else}
            <dice-roller label={title} formula={"к20+" + calculateAndFormatModifier(value)}>
                {value} ({calculateAndFormatModifier(value)})
            </dice-roller>
        {/if}
    </div>
</div>


<style>

    .scores-table-item {
        font-size: 12px;
        line-height: 1em;
        min-width: 0;
    }

    .scores-table-item-title {
        padding: 0.5em;
        background: var(--accent-bg);
        border-radius: 6px 6px 0px 0px;
    }

    .scores-table-item-value {
        padding: 0.5em;
        background: var(--accent-bg-sub);
        margin: 0px 0px 6px;;
        border-radius: 0px 0px 6px 6px;
    }

	.inputlike {
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
        width: 100%;
        text-align: center;
	}
</style>
