<script lang="ts">
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	import type { FullArmor } from "src/domain/models/armor/FullArmor";

    interface Props {
        currentItem: FullArmor,
        uiEventListener: IUiEventListener,
    }let { currentItem, uiEventListener }: Props = $props();
</script>