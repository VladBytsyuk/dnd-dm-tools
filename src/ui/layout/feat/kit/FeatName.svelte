<script lang="ts">
    import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	import type { Name } from "../../../../domain/models/common/Name";

    let {
        currentItem,
        isInEditMode,
        uiEventListener
    } = $props<{
        currentItem: { name: Name; };
        isInEditMode: boolean;
        uiEventListener: IUiEventListener;
    }>();
</script>

<div class="name-container">
    <input class="h1 inputlike" bind:value={currentItem.name.rus} readonly={!isInEditMode} />
    <input class="p inputlike" bind:value={currentItem.name.eng} readonly={!isInEditMode} />
</div>

<style>
    .name-container {
        display: flex;
        flex-direction: column;
    }

    .inputlike {
        border: 1px solid transparent;
        background: transparent;
    }
</style>
