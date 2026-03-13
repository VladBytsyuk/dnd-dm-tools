import { mount } from "svelte";
import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { BestiaryFilters } from "src/domain/models/monster/BestiaryFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallMonster } from "src/domain/models/monster/SmallMonster";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import MonsterFullUi from "src/ui/layout/monster/MonsterFullUi.svelte";
import MonsterSmallUi from "src/ui/layout/monster/MonsterSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class BestiarySidePanel extends BaseSidePanel<SmallMonster, FullMonster, BestiaryFilters> {

    getKey(): string { return "bestiary"; }
    getRibbonIconName(): string { return "skull"; }
    getTitle(): string { return "Бестиарий"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<BestiaryFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'types', label: 'Типы' },
            { key: 'challengeRatings', label: 'Опасность' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<BestiaryFilters>(['types', 'challengeRatings', 'sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => `Опасность ${group.sort}`,
                FullItemSlot: MonsterFullUi,
                SmallItemSlot: MonsterSmallUi,
            },
        });
    }
}
