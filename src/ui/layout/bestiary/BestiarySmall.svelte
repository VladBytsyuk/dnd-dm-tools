<script lang="ts">
    let { smallMonster } = $props();

    const { name, type, challengeRating, source } = smallMonster;
</script>

<div class="bestiary-small">
    <h2 class="monster-name">{name.rus}</h2>
    <p class="monster-type">Type: {type}</p>
    <p class="monster-challenge-rating">Challenge Rating: {challengeRating}</p>
    <p class="monster-source">Source: {source.shortName}</p>
</div>

<style>
    .bestiary-small {
        border: 1px solid #ccc;
        padding: 1rem;
        border-radius: 8px;
        background-color: #f9f9f9;
        margin: 1rem 0;
    }

    .monster-name {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .monster-type,
    .monster-challenge-rating,
    .monster-source {
        margin: 0.25rem 0;
        font-size: 1rem;
    }
</style>