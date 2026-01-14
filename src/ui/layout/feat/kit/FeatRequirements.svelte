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
    <b>Требования: </b> {currentItem.requirements}
</div>

<style>
    .requirements {
        margin-top: 4px;
        margin-bottom: 6px;
    }
</style>
