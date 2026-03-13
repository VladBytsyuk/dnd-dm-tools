import { mount } from "svelte";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallClass } from "src/domain/models/class/SmallClass";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import ClassFullUi from "src/ui/layout/class/ClassFullUi.svelte";
import ClassSmallUi from "src/ui/layout/class/ClassSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class ClassesSidePanel extends BaseSidePanel<SmallClass, FullClass, ClassesFilters> {

    getKey(): string { return "classes"; }
    getRibbonIconName(): string { return "graduation-cap"; }
    getTitle(): string { return "Классы"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<ClassesFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'diceTypes', label: 'Типы костей' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<ClassesFilters>(['diceTypes', 'sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: ClassFullUi,
                SmallItemSlot: ClassSmallUi,
            },
        });
    }
}
