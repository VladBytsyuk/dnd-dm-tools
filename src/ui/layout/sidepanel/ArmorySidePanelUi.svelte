<script lang="ts">
    import { emptyFilters } from "src/domain/models/common/Filters";
    import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
    import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
	import type { FullArmor } from "src/domain/models/armor/FullArmor";
	import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
	import type { Armory } from "src/domain/repositories/Armory";
	import ArmorFullUi from "../armor/ArmorFullUi.svelte";
	import ArmorSmallUi from "../armor/ArmorSmallUi.svelte";

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallArmor, FullArmor, ArmoryFilters, Armory> = $props();
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<ArmoryFilters>(['types', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort}
    FullItemSlot={ArmorFullUi}
    SmallItemSlot={ArmorSmallUi}
/>