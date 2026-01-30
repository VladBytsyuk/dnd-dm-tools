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
    import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let { initialFullItem, repository, uiEventListener }:
        SidePanelProps<SmallClass, FullClass, ClassesFilters, Repository<SmallClass, FullClass, ClassesFilters>> = $props();

    const filterConfig: FilterConfig<ClassesFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'diceTypes', label: 'Типы костей' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ClassesFilters>(['diceTypes', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={ClassFullUi}
    SmallItemSlot={ClassSmallUi}
/>
