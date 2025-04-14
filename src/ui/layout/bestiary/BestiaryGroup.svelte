<script>
    import BestiarySmall from './BestiarySmall.svelte';

    let { challengeRating, smallMonsters } = $props();
</script>

<div class="bestiary-group">
    <h2>Опасность {challengeRating}</h2>
    <div class="monster-grid">
        {#each smallMonsters as monster}<BestiarySmall smallMonster={monster}/>{/each}
    </div>
</div>

<style>
    .bestiary-group {
        margin: 1rem 0;
    }

    .bestiary-group h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .monster-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
</style>
