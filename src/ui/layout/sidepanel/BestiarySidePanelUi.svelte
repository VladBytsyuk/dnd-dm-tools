<script lang="ts">
	import type { Bestiary } from "src/domain/repositories/Bestiary";
	import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
	import type { FullMonster } from "src/domain/models/monster/FullMonster";
	import { emptyFilters } from "src/domain/models/common/Filters";
	import MonsterFullUi from "../monster/MonsterFullUi.svelte";
	import MonsterSmallUi from "../monster/MonsterSmallUi.svelte";
	import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
	import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallMonster, FullMonster, BestiaryFilters, Bestiary> = $props();

    const filterConfig: FilterConfig<BestiaryFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'types', label: 'Типы' },
        { key: 'challengeRatings', label: 'Опасность' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<BestiaryFilters>(['types', 'challengeRatings', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => `Опасность ${group.sort}`}
    FullItemSlot={MonsterFullUi}
    SmallItemSlot={MonsterSmallUi}
/>
