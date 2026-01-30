<script lang="ts" generics="F extends Filters">
    import type { Filters } from "src/domain/models/common/Filters";
    import type { FilterConfig } from "src/domain/utils/FilterConfig";
    import FilterBlock from "./FilterBlock.svelte";

    interface Props<F extends Filters> {
        fullFilters: F;
        initialFilters: F;
        filterConfig: FilterConfig<F>[];
        onApply: (filters: F) => void;
        onClose: () => void;
    }

    let { fullFilters, initialFilters, filterConfig, onApply, onClose }: Props<F> = $props();

    let currentFilters: F = $state({ ...initialFilters } as F);

    function toggleFilter(key: keyof F, value: string | number) {
        const current = currentFilters[key] as (string | number)[];
        if (current.includes(value)) {
            currentFilters = {
                ...currentFilters,
                [key]: current.filter(v => v !== value)
            } as F;
        } else {
            currentFilters = {
                ...currentFilters,
                [key]: [...current, value]
            } as F;
        }
    }

    function areFiltersEqual(a: F, b: F): boolean {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;

        for (const key of aKeys) {
            const aVal = a[key];
            const bVal = b[key];
            if (!Array.isArray(aVal) || !Array.isArray(bVal)) return false;
            if (aVal.length !== bVal.length) return false;

            const aSorted = [...aVal].sort();
            const bSorted = [...bVal].sort();
            for (let i = 0; i < aSorted.length; i++) {
                if (aSorted[i] !== bSorted[i]) return false;
            }
        }
        return true;
    }

    let hasChanges = $derived(!areFiltersEqual(initialFilters, currentFilters));

    function handleApply() {
        onApply(currentFilters);
        onClose();
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }
</script>

<div class="filters-overlay-backdrop" onclick={handleBackdropClick} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && onClose()}>
    <div class="filters-overlay">
        <div class="filters-header">
            <h2>Фильтры</h2>
            <button class="close-button" onclick={onClose}>✕</button>
        </div>
        <div class="filters-body">
            {#each filterConfig as config}
                <FilterBlock
                    title={config.label}
                    options={fullFilters[config.key] as (string | number)[]}
                    selected={currentFilters[config.key] as (string | number)[]}
                    onToggle={(value) => toggleFilter(config.key, value)}
                />
            {/each}
        </div>
        <div class="filters-footer">
            <button
                class="submit-button"
                class:mod-cta={hasChanges}
                onclick={handleApply}
            >
                Применить
            </button>
        </div>
    </div>
</div>

<style>
    .filters-overlay-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 100;
        padding-top: 20px;
    }

    .filters-overlay {
        background-color: var(--background-primary);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        width: 90%;
        max-height: calc(100% - 40px);
        display: flex;
        flex-direction: column;
    }

    .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .filters-header h2 {
        margin: 0;
        font-size: 1.2em;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: var(--text-muted);
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        color: var(--text-normal);
    }

    .filters-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }

    .filters-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--background-modifier-border);
        display: flex;
        justify-content: flex-end;
    }
</style>
