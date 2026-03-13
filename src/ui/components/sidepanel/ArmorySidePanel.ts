import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import { mount } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import ArmorFullUi from "src/ui/layout/armor/ArmorFullUi.svelte";
import ArmorSmallUi from "src/ui/layout/armor/ArmorSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class ArmorySidePanel extends BaseSidePanel<SmallArmor, FullArmor, ArmoryFilters> {

    getKey() { return 'armory'; }
    getRibbonIconName() { return 'shield'; }
    getTitle() { return 'Броня'; }

    async mountSvelteComponent(element: Element): Promise<void> {
        const filterConfig: FilterConfig<ArmoryFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'types', label: 'Типы' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<ArmoryFilters>(['types', 'sources']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: ArmorFullUi,
                SmallItemSlot: ArmorSmallUi,
            },
        });
    }
}
