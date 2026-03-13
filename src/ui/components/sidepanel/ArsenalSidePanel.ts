import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import { mount } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import WeaponFullUi from "src/ui/layout/weapon/WeaponFullUi.svelte";
import WeaponSmallUi from "src/ui/layout/weapon/WeaponSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";

export class ArsenalSidePanel extends BaseSidePanel<SmallWeapon, FullWeapon, ArsenalFilters> {

    getKey(): string { return "arsenal"; }
    getRibbonIconName(): string { return "axe"; }
    getTitle(): string { return "Арсенал"; }

    async mountSvelteComponent(element: Element) {
        const filterConfig: FilterConfig<ArsenalFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'dices', label: 'Кости' },
            { key: 'damageTypes', label: 'Типы урона' },
            { key: 'types', label: 'Типы' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<ArsenalFilters>(['types', 'sources', 'dices', 'damageTypes']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: WeaponFullUi,
                SmallItemSlot: WeaponSmallUi,
            },
        });
    }
}
