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

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallMonster, FullMonster, BestiaryFilters, Bestiary> = $props();           
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<BestiaryFilters>(['types', 'challangeRatings', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => `Опасность ${group.sort}`}
    FullItemSlot={MonsterFullUi}
    SmallItemSlot={MonsterSmallUi}
/>
