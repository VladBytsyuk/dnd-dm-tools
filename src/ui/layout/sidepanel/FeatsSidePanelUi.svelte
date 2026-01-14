<script lang="ts">
	import type { Feats } from "src/domain/repositories/Feats";
	import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
	import type { FullFeat } from "src/domain/models/feat/FullFeat";
	import { emptyFilters } from "src/domain/models/common/Filters";
	import FeatFullUi from "../feat/FeatFullUi.svelte";
	import FeatSmallUi from "../feat/FeatSmallUi.svelte";
	import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
	import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallFeat } from "src/domain/models/feat/SmallFeat";

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallFeat, FullFeat, FeatsFilters, Feats> = $props();           
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<FeatsFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={FeatFullUi}
    SmallItemSlot={FeatSmallUi}
/>
