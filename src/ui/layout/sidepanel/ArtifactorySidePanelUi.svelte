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
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallArtifact, FullArtifact, ArtifactoryFilters, Artifactory> = $props();

    const filterConfig: FilterConfig<ArtifactoryFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'types', label: 'Типы' },
        { key: 'rarities', label: 'Редкость' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ArtifactoryFilters>(['types', 'sources', 'rarities'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={ArtifactFullUi}
    SmallItemSlot={ArtifactSmallUi}
/>