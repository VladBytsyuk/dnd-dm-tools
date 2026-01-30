<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
    import type { SmallRace } from "src/domain/models/race/SmallRace";
    import type { FullRace } from "src/domain/models/race/FullRace";
    import type { RaceFilters } from "src/domain/models/race/RaceFilters";
    import type { Races } from "src/domain/repositories/Races";
    import RaceFullUi from "../race/RaceFullUi.svelte";
    import RaceSmallUi from "../race/RaceSmallUi.svelte";
    import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallRace, FullRace, RaceFilters, Races> = $props();

    const filterConfig: FilterConfig<RaceFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'abilities', label: 'Способности' },
        { key: 'types', label: 'Типы' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<RaceFilters>(['abilities', 'types', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={RaceFullUi}
    SmallItemSlot={RaceSmallUi}
/>
