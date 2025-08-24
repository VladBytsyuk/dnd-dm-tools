<script lang="ts">
    import { onkeydown } from "src/domain/utils/utils";
    import type { SmallBackground } from 'src/domain/models/background/SmallBackground';
	import SourceLabel from "../uikit/SourceLabel.svelte";

    interface Props {
        smallItem: SmallBackground,
        onItemClick: () => void,
    }
    let { smallItem, onItemClick }: Props = $props();
</script>

<div 
    class="background-small" 
    role="button"
    tabindex="0"
    onclick={onItemClick}
    onkeydown={onkeydown(onItemClick)}
>
    <div class="background-small__content">
        <div class="row">
            <div>
                <h4 class="background-small__title">{smallItem.name.rus}</h4>
                <p class="background-small__subtitle">{smallItem.name.eng}</p>
            </div>
            <div class="background-small__source">
                <SourceLabel source={smallItem.source} />
            </div>
        </div>
    </div>
</div>

<style>
    .background-small {
        flex: 1 1 100%;
        padding: 0.5rem;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--background-primary);
    }

    .row {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: flex-start;
    }

    .background-small:hover {
        border-color: var(--interactive-accent);
        background: var(--background-modifier-hover);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .background-small__content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .background-small__title {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-accent);
        font-weight: 600;
    }

    .background-small__subtitle {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-muted);
        font-style: italic;
    }

    .background-small__source {
        margin-top: 0.25rem;
    }
</style>