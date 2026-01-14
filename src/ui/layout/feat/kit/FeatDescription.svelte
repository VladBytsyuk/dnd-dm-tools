<script lang="ts">
    let {
        currentItem,
        isInEditMode
    } = $props<{
        currentItem: { description: string; };
        isInEditMode: boolean;
    }>();
</script>

<div class="description">
    <textarea class="inputlike" bind:value={currentItem.description} readonly={!isInEditMode}></textarea>
</div>

<style>
    .description {
        margin-top: 5px;
    }

    .inputlike {
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
        resize: vertical;
    }
</style>
