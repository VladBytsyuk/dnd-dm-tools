<script lang="ts">
    import type { Repository } from "src/domain/repositories/Repository";
    import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
    import type { FullClass } from "src/domain/models/class/FullClass";
    import type { SmallClass } from "src/domain/models/class/SmallClass";
    import { emptyFilters } from "src/domain/models/common/Filters";
    import ClassFullUi from "../class/ClassFullUi.svelte";
    import ClassSmallUi from "../class/ClassSmallUi.svelte";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";

    let { initialFullItem, repository, uiEventListener, openFiltersModal }:
        SidePanelProps<SmallClass, FullClass, ClassesFilters, Repository<SmallClass, FullClass, ClassesFilters>> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ClassesFilters>(['diceTypes', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={ClassFullUi}
    SmallItemSlot={ClassSmallUi}
/>
