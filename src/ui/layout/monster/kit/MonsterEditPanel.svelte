<script lang="ts">
	import { Check, Pencil, X } from "lucide-svelte";

    let {
        isInEditMode,
        onEditModeChange
    } = $props<{
        isInEditMode: boolean;
        onEditModeChange: (isInEditMode: boolean, saveChanges: boolean) => void;
    }>();
</script>
  
<div class="edit-root">
    {#if !isInEditMode}
        <div
            class="edit-button"
            role="button"
            tabindex="0"
            onclick={() => onEditModeChange(true, false)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onEditModeChange(true, false); } }}
            aria-label="Редактировать существо"
        >
            <Pencil size="16" />
        </div>
    {:else}
        <div
            class="edit-button"
            role="button"
            tabindex="0"
            onclick={() => onEditModeChange(false, true)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onEditModeChange(false, true); } }}
            aria-label="Сохранить изменения"
        >
            <Check size="16" />
        </div>
        <div
            class="edit-button"
            role="button"
            tabindex="0"
            onclick={() => onEditModeChange(false, false)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onEditModeChange(false, false); } }}
            aria-label="Сбросить изменения"
        >
            <X size="16" />
        </div>
    {/if}
</div>

<style>
    .edit-root {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .edit-button {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .edit-button:hover,
    .edit-button:focus {
        background-color: var(--color-accent-hover);
        outline: none;
    }
</style>
