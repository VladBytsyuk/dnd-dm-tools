import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import DmScreenSidePanelUi from "src/ui/layout/sidepanel/DmScreenSidePanelUi.svelte";
import { mount } from "svelte";
import { BaseSidePanel } from "./BaseSidePanel";
import { DmScreenRepository } from "src/data/repositories/DmScreenRepository";

export class DmScreenSidePanel extends BaseSidePanel<DmScreenItem, DmScreenItem, any> {

    getKey(): string { return "dm-screen"; }
    getRibbonIconName(): string { return "book-open"; }
    getTitle(): string { return "Ширма"; }

    async mountSvelteComponent(element: Element) {
        if (!(this.repository instanceof DmScreenRepository)) {
            throw new Error("DmScreenSidePanel can only be used with DmScreenRepository");
        }
        const dmScreenRepository = this.repository as DmScreenRepository;
        mount(DmScreenSidePanelUi, {
            target: element,
            props: {
                item: this.fullItem,
                children: await dmScreenRepository.getAllRootItems(),
                uiEventListener: this.uiEventListener,
                getFilteredItems: async (name: string) => await dmScreenRepository.getFilteredItems(name),
                getChildrenCount: async (item: DmScreenItem) => await dmScreenRepository.getChildrenCount(item),
                getChildren: async (item: DmScreenItem) => await dmScreenRepository.getChildren(item),
                getFullItem: async (item: DmScreenItem) => await dmScreenRepository.getFullItem(item),
            },
        });
    }
}
