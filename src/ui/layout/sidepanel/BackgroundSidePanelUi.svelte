<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallBackground } from "src/domain/models/background/SmallBackground";
	import type { FullBackground } from "src/domain/models/background/FullBackground";
	import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
	import type { Backgrounds } from "src/domain/repositories/Backgrounds";
	import BackgroundFullUi from "../background/BackgroundFullUi.svelte";
	import BackgroundSmallUi from "../background/BackgroundSmallUi.svelte";

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallBackground, FullBackground, BackgroundsFilters, Backgrounds> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<BackgroundsFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={BackgroundFullUi}
    SmallItemSlot={BackgroundSmallUi}
/>