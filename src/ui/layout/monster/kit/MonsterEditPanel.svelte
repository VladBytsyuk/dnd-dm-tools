<script lang="ts">
	import { Check, Pencil, Trash, X } from "lucide-svelte";
	import IconButton from "../../uikit/IconButton.svelte";

    let {
        isInEditMode,
        onEditModeChange,
        onItemDelete
    } = $props<{
        isInEditMode: boolean;
        onEditModeChange: (isInEditMode: boolean, saveChanges: boolean) => void;
        onItemDelete: () => void;
    }>();
</script>
  
<div class="edit-root">
    {#if !isInEditMode}
        <IconButton icon={Pencil} size={16} hint="Редактировать существо" onClick={() => onEditModeChange(true, false)} />
        <IconButton icon={Trash} size={16} hint="Удалить существо" onClick={onItemDelete} />
    {:else}
        <IconButton icon={Check} size={16} hint="Сохранить изменения" onClick={() => onEditModeChange(false, true)} />
        <IconButton icon={X} size={16} hint="Сбросить изменения" onClick={() => onEditModeChange(false, false)} />
    {/if}
</div>

<style>
    .edit-root {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
