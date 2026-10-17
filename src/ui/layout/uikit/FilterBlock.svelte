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
        color?: string;
    }

    let { title, options, selected, onToggle, color = "var(--dnd-ui-accent-primary)" }: Props = $props();
    const dsTheme = $derived($appTheme === Theme.Dark ? "dark" : "light");
    let isExpanded = $state(true);

    function isSelected(value: string | number): boolean {
        return selected.includes(value);
    }
</script>

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
                    background={isSelected(option) ? color : undefined}
                    theme={dsTheme}
                />
            </button>
        {/each}
    </div>
</UiCollapsibleGroup>

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

</style>
