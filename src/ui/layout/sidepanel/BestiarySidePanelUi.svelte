<script lang="ts">
	import type { Bestiary } from "src/domain/repositories/Bestiary";
	import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
	import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
	import type { FullMonster } from "src/domain/models/monster/FullMonster";
	import { emptyFilters } from "src/domain/models/common/Filters";
	import MonsterFullUi from "../monster/MonsterFullUi.svelte";
	import MonsterSmallUi from "../monster/MonsterSmallUi.svelte";
	import BaseSidePanelUi from "./BaseSidePanelUi.svelte";

    // ---- Props ----
    interface Props {
        initialFullMonster?: FullMonster;
        bestiary: Bestiary;
        uiEventListener: IUiEventListener;
        openFiltersModal: (fullFilters: BestiaryFilters, filters: BestiaryFilters, onApply: (newFilters: BestiaryFilters) => Promise<void>) => void;
    }

    let { 
        initialFullMonster,
        bestiary,
        uiEventListener,
        openFiltersModal,
    }: Props = $props();           
</script>

<BaseSidePanelUi
    initialFullItem={initialFullMonster}
    initialFilters={emptyFilters<BestiaryFilters>(['types', 'challangeRatings', 'sources'])}
    uiEventListener={uiEventListener}
    repository={bestiary}
    openFiltersModal={openFiltersModal}
    FullItemSlot={MonsterFullUi}
    SmallItemSlot={MonsterSmallUi}
/>
