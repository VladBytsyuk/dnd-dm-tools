import type { FullSpell } from "src/domain/models/spell/FullSpell";
import { mount } from "svelte";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallSpell } from "src/domain/models/spell/SmallSpell";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import SpellFullUi from "src/ui/layout/spell/SpellFullUi.svelte";
import SpellSmallUi from "src/ui/layout/spell/SpellSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class SpellBookSidePanel extends BaseSidePanel<SmallSpell, FullSpell, SpellbookFilters> {

    getKey(): string { return "spellbook"; }
    getRibbonIconName(): string { return "sparkles"; }
    getTitle(): string { return "Книга заклинаний"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<SpellbookFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'levels', label: 'Уровни' },
            { key: 'schools', label: 'Школы' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<SpellbookFilters>(['schools', 'levels', 'classes', 'sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort !== "0" ? `Круг ${group.sort}` : "Заговоры",
                FullItemSlot: SpellFullUi,
                SmallItemSlot: SpellSmallUi,
            },
        });
    }
} 
