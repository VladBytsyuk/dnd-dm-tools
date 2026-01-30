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
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallFeat, FullFeat, FeatsFilters, Feats> = $props();

    const filterConfig: FilterConfig<FeatsFilters>[] = [
        { key: 'sources', label: 'Источник' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<FeatsFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={FeatFullUi}
    SmallItemSlot={FeatSmallUi}
/>
