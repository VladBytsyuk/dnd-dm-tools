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
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallBackground, FullBackground, BackgroundsFilters, Backgrounds> = $props();

    const filterConfig: FilterConfig<BackgroundsFilters>[] = [
        { key: 'sources', label: 'Источник' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<BackgroundsFilters>(['sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={BackgroundFullUi}
    SmallItemSlot={BackgroundSmallUi}
/>