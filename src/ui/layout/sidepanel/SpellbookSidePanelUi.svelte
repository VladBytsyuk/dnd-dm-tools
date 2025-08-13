<script lang="ts">
	import { type SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
	import type { FullSpell } from "src/domain/models/spell/FullSpell";
	import type { Spellbook } from "src/domain/repositories/Spellbook";
	import BaseSidePanelUi from "../uikit/BaseSidePanelUi.svelte";
	import SpellFullUi from "../spell/SpellFullUi.svelte";
	import SpellSmallUi from "../spell/SpellSmallUi.svelte";
	import { emptyFilters } from "src/domain/models/common/Filters";
	import type { SidePanelProps } from "src/domain/utils/props/SidePanelProps";
	import type { SmallSpell } from "src/domain/models/spell/SmallSpell";

    let { 
        initialFullItem,
        repository,
        uiEventListener,
        openFiltersModal,
    }: SidePanelProps<SmallSpell, FullSpell, SpellbookFilters, Spellbook> = $props(); 
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<SpellbookFilters>(['schools', 'levels', 'classes', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    openFiltersModal={openFiltersModal}
    groupTitleBuilder={(group) => group.sort !== "0" ? `Круг ${group.sort}` : "Заговоры"}
    FullItemSlot={SpellFullUi}
    SmallItemSlot={SpellSmallUi}
/>
