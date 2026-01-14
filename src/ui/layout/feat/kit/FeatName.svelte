<script lang="ts">
    import { Name } from "src/domain/models/common/Name";
    import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
    import EditableText from "../../uikit/EditableText.svelte";

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
    <EditableText bind:text={currentItem.name.rus} {isInEditMode} classes="h1" />
    <EditableText bind:text={currentItem.name.eng} {isInEditMode} classes="p" />
</div>

<style>
    .name-container {
        display: flex;
        flex-direction: column;
    }
</style>
