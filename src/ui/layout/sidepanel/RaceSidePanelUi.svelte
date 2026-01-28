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

    let {
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallRace, FullRace, RaceFilters, Races> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<RaceFilters>(['abilities', 'types', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={RaceFullUi}
    SmallItemSlot={RaceSmallUi}
/>
