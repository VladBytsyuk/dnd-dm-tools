<script lang="ts">
    import EditableText from "../../uikit/EditableText.svelte";

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
    <EditableText bind:text={currentItem.requirements} {isInEditMode} />
</div>

<style>
    .requirements {
        margin-top: 5px;
    }
</style>
