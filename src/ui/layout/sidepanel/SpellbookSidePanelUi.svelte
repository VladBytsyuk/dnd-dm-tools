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
	import type { FilterConfig } from "src/domain/utils/FilterConfig";

    let {
        initialFullItem,
        repository,
        uiEventListener,
    }: SidePanelProps<SmallSpell, FullSpell, SpellbookFilters, Spellbook> = $props();

    const filterConfig: FilterConfig<SpellbookFilters>[] = [
        { key: 'sources', label: 'Источник' },
        { key: 'levels', label: 'Уровни' },
        { key: 'schools', label: 'Школы' },
    ];
</script>

<BaseSidePanelUi
    initialFullItem={initialFullItem}
    initialFilters={emptyFilters<SpellbookFilters>(['schools', 'levels', 'classes', 'sources'])}
    uiEventListener={uiEventListener}
    repository={repository}
    filterConfig={filterConfig}
    groupTitleBuilder={(group) => group.sort !== "0" ? `Круг ${group.sort}` : "Заговоры"}
    FullItemSlot={SpellFullUi}
    SmallItemSlot={SpellSmallUi}
/>
