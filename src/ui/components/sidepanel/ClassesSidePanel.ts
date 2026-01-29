import { mount } from "svelte";
import ClassesSidePanelUi from "src/ui/layout/sidepanel/ClassesSidePanelUi.svelte";
import type { FullClass } from "src/domain/models/class/FullClass";
import type { ClassesFilters } from "src/domain/models/class/ClassesFilters";
import { ClassesFiltersModal } from "../modals/ClassesFiltersModal";
import { BaseSidePanel } from "./BaseSidePanel";
import type { SmallClass } from "src/domain/models/class/SmallClass";

export class ClassesSidePanel extends BaseSidePanel<SmallClass, FullClass, ClassesFilters> {

    getKey(): string { return "classes"; }
    getRibbonIconName(): string { return "graduation-cap"; }
    getTitle(): string { return "Классы"; }

    async mountSvelteComponent(element: Element) {
        mount(ClassesSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                openFiltersModal: (fullFilters: ClassesFilters, filters: ClassesFilters, onApply: (newFilters: ClassesFilters) => Promise<void>) => {
                    new ClassesFiltersModal(this.plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }
}
