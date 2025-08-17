<script lang="ts">
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";

    interface Props {
        smallItem: SmallArtifact;
        onItemClick: () => void;
    }
    let { smallItem, onItemClick }: Props = $props();
</script>