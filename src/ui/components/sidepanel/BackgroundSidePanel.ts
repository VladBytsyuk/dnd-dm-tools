import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullBackground } from "src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import { mount } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import BackgroundFullUi from "src/ui/layout/background/BackgroundFullUi.svelte";
import BackgroundSmallUi from "src/ui/layout/background/BackgroundSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class BackgroundSidePanel extends BaseSidePanel<SmallBackground, FullBackground, BackgroundsFilters>{

    getKey() { return 'backgrounds' as const; }
    getRibbonIconName() { return 'book-a'; }
    getTitle() { return 'Предыстории'; }

    async mountSvelteComponent(element: Element): Promise<unknown> {
        const filterConfig: FilterConfig<BackgroundsFilters>[] = [
            { key: 'sources', label: 'Источник' },
        ];

        return mount(BaseSidePanelUi, {
            target: element,
            props: {
                panelKey: this.getKey(),
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<BackgroundsFilters>(['sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: BackgroundFullUi,
                SmallItemSlot: BackgroundSmallUi,
            },
        });
    }
}
