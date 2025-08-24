<script lang="ts">
    import type { IUiEventListener } from 'src/domain/listeners/ui_event_listener.js';
    import type { SmallBackground } from 'src/domain/models/background/SmallBackground';

    interface Props {
        currentItem: SmallBackground,
        uiEventListener: IUiEventListener,
    }
    let { currentItem, uiEventListener }: Props = $props();

    const onBackgroundClick = () => {
        uiEventListener.onItemClick(currentItem.url);
    };
</script>

<div class="background-small" onclick={onBackgroundClick}>
    <div class="background-small__content">
        <h4 class="background-small__title">{currentItem.name.rus}</h4>
        <p class="background-small__subtitle">{currentItem.name.eng}</p>
        <div class="background-small__source">
            <small>{currentItem.source.shortName}</small>
        </div>
    </div>
</div>

<style>
    .background-small {
        padding: 0.75rem;
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--background-primary);
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
        font-size: 1rem;
        color: var(--text-accent);
        font-weight: 600;
    }

    .background-small__subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-muted);
        font-style: italic;
    }

    .background-small__source {
        margin-top: 0.25rem;
    }

    .background-small__source small {
        color: var(--text-faint);
        font-size: 0.75rem;
        padding: 0.125rem 0.375rem;
        background: var(--background-secondary);
        border-radius: 3px;
    }
</style>