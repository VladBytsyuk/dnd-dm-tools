<script lang="ts" generics="F extends Filters">
    import { onMount } from "svelte";
    import { Check, X } from "lucide-svelte";
    import { Chip as DsChip } from "@dnd-dm-tools/design-system";
    import { theme as appTheme, Theme } from "src/ui/theme";
    import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";
    import type { Filters } from "src/domain/models/common/Filters";
    import type { FilterConfig } from "src/domain/utils/FilterConfig";
    import { getRedesignPanelTypeColor } from "./PanelTypeColor";
    import FilterBlock from "./FilterBlock.svelte";

    interface Props<F extends Filters> {
        fullFilters: F;
        initialFilters: F;
        filterConfig: FilterConfig<F>[];
        onApply: (filters: F) => void;
        onClose: () => void;
        panelKey?: PanelKey;
        redesignEnabled?: boolean;
    }

    let { fullFilters, initialFilters, filterConfig, onApply, onClose, panelKey = "bestiary", redesignEnabled = false }: Props<F> = $props();
    const color = $derived(getRedesignPanelTypeColor(panelKey));
    const dsTheme = $derived($appTheme === Theme.Dark ? "dark" : "light");
    let screen = $state<HTMLDivElement>();
    let closeButton = $state<HTMLButtonElement>();

    onMount(() => {
        if (redesignEnabled) closeButton?.focus({ preventScroll: true });
    });

    function onScreenKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
        } else if (event.key === "Tab" && screen) {
            const controls = Array.from(screen.querySelectorAll<HTMLElement>("button:not([disabled]), summary"))
                .filter((node) => node.tagName === "SUMMARY" || !node.closest("details:not([open])"));
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === screen)) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }
    }

    function getInitialFilters() {
        return { ...initialFilters } as F;
    }

    let currentFilters: F = $state(getInitialFilters());

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

{#snippet filterGroups()}
    {#each filterConfig as config (config.key)}
        <FilterBlock
            title={config.label}
            options={fullFilters[config.key] as (string | number)[]}
            selected={currentFilters[config.key] as (string | number)[]}
            onToggle={(value) => toggleFilter(config.key, value)}
            {redesignEnabled}
            {color}
        />
    {/each}
{/snippet}

{#if redesignEnabled}
<div class="filters-screen-backdrop">
    <button type="button" class="filters-screen-dismiss" tabindex="-1" aria-label="Закрыть фильтры без применения" onclick={onClose}></button>
    <div class="filters-screen" role="dialog" aria-label="Фильтры" tabindex="-1" bind:this={screen} onkeydown={onScreenKeydown}>
        <header class="filters-screen-header">
            <h2>Фильтры</h2>
            <button type="button" class="filters-screen-close" aria-label="Закрыть фильтры" bind:this={closeButton} onclick={onClose}><X size={20} aria-hidden={true} /></button>
        </header>
        <div class="filters-screen-body">
            {@render filterGroups()}
        </div>
        <footer class="filters-screen-footer">
            <button type="button" class="filters-screen-apply" class:has-changes={hasChanges} style:--filters-accent={color} onclick={handleApply}>
                <DsChip text="Применить" icon={Check} background={color} theme={dsTheme} />
            </button>
        </footer>
    </div>
</div>
{:else}
<div class="filters-overlay-backdrop" onclick={handleBackdropClick} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && onClose()}>
    <div class="filters-overlay">
        <div class="filters-header">
            <h2>Фильтры</h2>
            <button class="close-button" onclick={onClose}>✕</button>
        </div>
        <div class="filters-body">
            {@render filterGroups()}
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
{/if}

<style>
    .filters-screen-backdrop {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: flex;
        flex-direction: column;
        background: rgb(48 48 48 / 90%);
        overflow: hidden;
        overscroll-behavior: contain;
    }

    .filters-screen-dismiss,
    .filters-screen-dismiss:hover,
    .filters-screen-dismiss:active {
        all: unset;
        position: absolute;
        inset: 0;
        cursor: default;
    }

    .filters-screen {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 0 1 auto;
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        min-height: 0;
        max-height: 100%;
        background: var(--dnd-ui-surface-base, var(--background-primary));
        color: var(--dnd-ui-text-primary);
        border: 1px solid var(--dnd-ui-border-subtle);
        border-radius: var(--dnd-ui-radius-lg);
        box-shadow: var(--dnd-ui-pattern-modal-shadow);
    }

    .filters-screen-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--dnd-ui-space-8);
        padding: var(--dnd-ui-space-8) var(--dnd-ui-space-12);
        border-bottom: 1px solid var(--dnd-ui-border-subtle);
        flex-shrink: 0;
    }

    .filters-screen-header h2 { margin: 0; font-size: var(--dnd-ui-font-size-xl); }
    .filters-screen-close {
        display: grid;
        place-items: center;
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
        color: var(--dnd-ui-text-primary);
        cursor: pointer;
    }
    .filters-screen-close:hover { background: var(--dnd-ui-surface-hover); }
    .filters-screen-close:focus-visible { outline: 2px solid var(--dnd-ui-accent-primary); outline-offset: -2px; }

    .filters-screen-body {
        display: grid;
        align-content: start;
        gap: var(--dnd-ui-space-8);
        flex: 1 1 auto;
        min-height: 0;
        padding: var(--dnd-ui-space-8);
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
    }

    .filters-screen-footer {
        flex-shrink: 0;
        padding: var(--dnd-ui-space-8) var(--dnd-ui-space-12);
        border-top: 1px solid var(--dnd-ui-border-subtle);
    }
    .filters-screen-apply {
        all: unset;
        display: block;
        box-sizing: border-box;
        width: 100%;
        border-radius: calc(4 * var(--ds-media-unit, 1px));
        cursor: pointer;
    }
    .filters-screen-apply :global(.chip) {
        box-sizing: border-box;
        justify-content: center;
        width: 100%;
        min-height: 32px;
    }
    .filters-screen-apply :global(.icon-wrapper) { align-self: center; }
    .filters-screen-footer .filters-screen-apply.has-changes :global(.chip) {
        background: var(--filters-accent);
        color: var(--text-on-accent, #fff);
    }
    .filters-screen-apply:focus-visible { outline: 2px solid var(--filters-accent); outline-offset: 2px; }

    .filters-overlay-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--dnd-ui-pattern-overlay-bg);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 100;
        padding-top: var(--dnd-ui-space-20);
    }

    .filters-overlay {
        background-color: var(--background-primary);
        border-radius: var(--dnd-ui-radius-lg);
        box-shadow: var(--dnd-ui-pattern-modal-shadow);
        max-width: 600px;
        width: 90%;
        height: 300px;
        display: flex;
        flex-direction: column;
    }

    .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--dnd-ui-space-16) var(--dnd-ui-space-20);
        border-bottom: 1px solid var(--dnd-ui-border-subtle);
    }

    .filters-header h2 {
        margin: 0;
        font-size: var(--dnd-ui-font-size-xl);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: var(--dnd-ui-text-muted);
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-button:hover {
        color: var(--dnd-ui-text-primary);
    }

    .filters-body {
        padding: var(--dnd-ui-space-20);
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }

    .filters-footer {
        padding: var(--dnd-ui-space-16) var(--dnd-ui-space-20);
        border-top: 1px solid var(--dnd-ui-border-subtle);
        display: flex;
        justify-content: flex-end;
    }
</style>
