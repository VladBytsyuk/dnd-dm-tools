<script lang="ts">
    import { Check } from "lucide-svelte";
    import { Chip as DsChip } from "@dnd-dm-tools/design-system";
    import { theme as appTheme, Theme } from "src/ui/theme";
    import UiCollapsibleGroup from "./organisms/UiCollapsibleGroup.svelte";

    interface Props {
        title: string;
        options: (string | number)[];
        selected: (string | number)[];
        onToggle: (value: string | number) => void;
        redesignEnabled?: boolean;
        color?: string;
    }

    let { title, options, selected, onToggle, redesignEnabled = false, color = "var(--dnd-ui-accent-primary)" }: Props = $props();
    const dsTheme = $derived($appTheme === Theme.Dark ? "dark" : "light");

    function initiallyExpanded() {
        return redesignEnabled && selected.length > 0;
    }

    let isExpanded = $state(initiallyExpanded());

    function isSelected(value: string | number): boolean {
        return selected.includes(value);
    }
</script>

{#if redesignEnabled}
    <UiCollapsibleGroup {title} {color} bind:isOpen={isExpanded}>
        <div class="filter-options" style:--filter-color={color}>
            {#each options as option (option)}
                <button
                    type="button"
                    class="filter-option"
                    aria-pressed={isSelected(option)}
                    onclick={() => onToggle(option)}
                >
                    <DsChip
                        text={String(option)}
                        active={isSelected(option)}
                        icon={isSelected(option) ? Check : undefined}
                        background={color}
                        theme={dsTheme}
                    />
                </button>
            {/each}
        </div>
    </UiCollapsibleGroup>
{:else}
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
{/if}

<style>
    .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: var(--dnd-ui-space-8);
        padding: var(--dnd-ui-space-8);
        background: var(--dnd-ui-pattern-group-content-bg);
    }

    .filter-option {
        all: unset;
        display: inline-flex;
        min-width: 0;
        max-width: 100%;
        border-radius: calc(4 * var(--ds-media-unit, 1px));
        cursor: pointer;
    }

    .filter-option:focus-visible { outline: 2px solid var(--filter-color); outline-offset: 2px; }

    .filter-options .filter-option[aria-pressed="true"] :global(.chip) {
        background: var(--filter-color);
        color: var(--text-on-accent, #fff);
    }

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
