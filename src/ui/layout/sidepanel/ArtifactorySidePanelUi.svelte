<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
	import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
	import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
	import type { Artifactory } from "src/domain/repositories/Artifactory";
	import ArtifactFullUi from "../artifact/ArtifactFullUi.svelte";
	import ArtifactSmallUi from "../artifact/ArtifactSmallUi.svelte";

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallArtifact, FullArtifact, ArtifactoryFilters, Artifactory> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ArtifactoryFilters>(['types', 'sources', 'rarities'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={ArtifactFullUi}
    SmallItemSlot={ArtifactSmallUi}
/>