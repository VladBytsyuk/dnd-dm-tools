<script lang="ts">
	import { rollRaw } from "src/domain/dice";

    let { formula, label, content, onRoll } = $props()

    const roll = () => {
        const rollValue = rollRaw(formula);
        onRoll(label, rollValue);
    }

    const handleEnterPress = (e: any) => {
        if (e.key === "Enter") roll()
    }
</script>
  
<a class="dice-roller"
    onclick={roll} 
    onkeypress={handleEnterPress}
    href={label}
    title={label}
>
    {#if content} {@html content}
    {:else if formula} {formula}
    {:else} {label}
    {/if}
</a>
  
<style>
    .dice-roller {
        cursor: pointer;
    }
</style>
