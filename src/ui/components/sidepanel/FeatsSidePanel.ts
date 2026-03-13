import { mount } from "svelte";
import type { FullFeat } from "src/domain/models/feat/FullFeat";
import type { FeatsFilters } from "src/domain/models/feat/FeatsFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallFeat } from "src/domain/models/feat/SmallFeat";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import FeatFullUi from "src/ui/layout/feat/FeatFullUi.svelte";
import FeatSmallUi from "src/ui/layout/feat/FeatSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class FeatsSidePanel extends BaseSidePanel<SmallFeat, FullFeat, FeatsFilters> {

    getKey(): string { return "feats"; }
    getRibbonIconName(): string { return "award"; }
    getTitle(): string { return "Черты"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<FeatsFilters>[] = [
            { key: 'sources', label: 'Источник' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<FeatsFilters>(['sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: FeatFullUi,
                SmallItemSlot: FeatSmallUi,
            },
        });
    }
}
