<script lang="ts">
    let {
        currentItem,
        isInEditMode
    } = $props<{
        currentItem: { requirements: string; };
        isInEditMode: boolean;
    }>();
</script>

<div class="requirements">
    <b>Требования: </b>
    <input class="inputlike" bind:value={currentItem.requirements} readonly={!isInEditMode} />
</div>

<style>
    .requirements {
        margin-top: 5px;
    }

    .inputlike {
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
    }
</style>
