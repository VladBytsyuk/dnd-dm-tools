<script lang="ts">
    import EditableText from "../../uikit/EditableText.svelte";

    let {
        currentItem,
        isInEditMode
    } = $props<{
        currentItem: { description: string; };
        isInEditMode: boolean;
    }>();
</script>

<div class="description">
    <EditableText bind:text={currentItem.description} {isInEditMode} />
</div>
