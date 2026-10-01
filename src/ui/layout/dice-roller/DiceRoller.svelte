<script lang="ts">
	import { rollRawTrace } from "src/domain/dice";

    let { formula, label, content, multiplier = 1, onRoll } = $props()

    const roll = () => {
        const baseRoll = rollRawTrace(formula);
        const rollValue = multiplier === 1
            ? baseRoll
            : {
                ...baseRoll,
                total: baseRoll.total * multiplier,
                resolvedFormula: `(${baseRoll.resolvedFormula.trim()}) × ${multiplier}`,
            };
        onRoll(label, rollValue);
    }

</script>
  
<button class="dice-roller" type="button" onclick={roll}>
    {#if content} {@html content}
    {:else if formula} {formula}
    {:else} {label}
    {/if}
</button>
  
<style>
    .dice-roller {
        all: unset;
        cursor: pointer;
        display: inline;
        box-sizing: border-box;
        color: inherit;
        font: inherit;
        line-height: inherit;
        text-decoration: underline;
        text-align: inherit;
        vertical-align: baseline;
    }

    .dice-roller:focus-visible {
        outline: 1px solid currentcolor;
        outline-offset: 1px;
    }
</style>
