<script lang="ts">
    interface Props {
        title: string;
        options: (string | number)[];
        selected: (string | number)[];
        onToggle: (value: string | number) => void;
    }

    let { title, options, selected, onToggle }: Props = $props();
    let isExpanded = $state(false);

    function isSelected(value: string | number): boolean {
        return selected.includes(value);
    }
</script>

<div class="filter-block">
    <button
        class="filter-block-toggle"
        aria-expanded={isExpanded}
        onclick={() => isExpanded = !isExpanded}
    >
        <span class="filter-block-indicator">{isExpanded ? 'v' : '>'}</span>
        <span class="filter-block-title">{title}</span>
    </button>

    {#if isExpanded}
        <div class="filter-buttons">
            {#each options as option}
                <button
                    class="filter-item"
                    class:mod-cta={isSelected(option)}
                    onclick={() => onToggle(option)}
                >
                    {option}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .filter-block {
        margin-bottom: var(--dnd-ui-space-12);
    }

    .filter-block-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--dnd-ui-space-8);
        background: none;
        border: none;
        padding: var(--dnd-ui-space-4) 0;
        color: var(--dnd-ui-text-primary);
        cursor: pointer;
        font: inherit;
        text-align: left;
    }

    .filter-block-indicator {
        width: 1em;
        flex: 0 0 1em;
        color: var(--dnd-ui-text-muted);
        text-align: center;
    }

    .filter-block-title {
        font-weight: var(--font-semibold);
    }

    .filter-buttons {
        margin-top: var(--dnd-ui-space-8);
    }
</style>
