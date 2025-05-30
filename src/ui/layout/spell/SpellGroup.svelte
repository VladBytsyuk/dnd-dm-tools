<script lang="ts">
    import SpellSmall from './SpellSmall.svelte';

    let { level, smallSpells, onSpellClick } = $props();
</script>

<div class="spell-group">
    <details open>
        <summary class="spell-group-title">Круг {level}</summary>
        <div class="spell-grid">
            {#each smallSpells as spell}
                <SpellSmall smallSpell={spell} onClick={onSpellClick}/>
            {/each}
        </div>
    </details>
</div>

<style>
    .spell-group {
        margin: 1rem 0;
    }
    
    .spell-group details {
        user-select: none;
    }

    .spell-group-title {
        font-size: 1.2rem;
        font-weight: bold;
        width: 100%;
        padding-bottom: 8px;
        margin-bottom: 0.5rem;
        border-bottom: 2px solid var(--text-color);
    }

    .spell-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
</style>
