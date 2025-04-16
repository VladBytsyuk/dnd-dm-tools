<script>
    import BestiarySmall from './BestiarySmall.svelte';

    let { challengeRating, smallMonsters } = $props();
</script>

<div class="bestiary-group">
    <details open>
        <summary class="bestiary-group-title">Опасность {challengeRating}</summary>
        <div class="monster-grid">
            {#each smallMonsters as monster}<BestiarySmall smallMonster={monster}/>{/each}
        </div>
    </details>
</div>

<style>
    .bestiary-group {
        margin: 1rem 0;
    }
    
    .bestiary-group details {
        user-select: none;
    }

    .bestiary-group-title {
        font-size: 1.2rem;
        font-weight: bold;
        width: 100%;
        padding-bottom: 8px;
        margin-bottom: 0.5rem;
        border-bottom: 2px solid #ccc;
    }

    .monster-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
</style>
