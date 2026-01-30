<script lang="ts">
    interface Props {
        title: string;
        options: (string | number)[];
        selected: (string | number)[];
        onToggle: (value: string | number) => void;
    }

    let { title, options, selected, onToggle }: Props = $props();

    function isSelected(value: string | number): boolean {
        return selected.includes(value);
    }
</script>

<div class="filter-block">
    <h3>{title}</h3>
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
</div>
