import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";
import { BaseSidePanel } from "./BaseSidePanel";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import { mount } from "svelte";
import BaseSidePanelUi from "src/ui/layout/uikit/BaseSidePanelUi.svelte";
import ArtifactFullUi from "src/ui/layout/artifact/ArtifactFullUi.svelte";
import ArtifactSmallUi from "src/ui/layout/artifact/ArtifactSmallUi.svelte";
import { emptyFilters } from "src/domain/models/common/Filters";
import type { FilterConfig } from "src/domain/utils/FilterConfig";
import type { Group } from "src/domain/repositories/Repository";

const rarityGroupTitles: Record<string, string> = {
    O: "Обычные",
    Н: "Необычные",
    Р: "Редкие",
    OР: "Очень редкие",
    Л: "Легендарные",
    А: "Артефакты",
    "~": "Редкость варьируется или не определена",
};

export class ArtifactorySidePanel extends BaseSidePanel<SmallArtifact, FullArtifact, ArtifactoryFilters>{

    getKey() { return 'artifactory' as const; }
    getRibbonIconName() { return 'wand'; }
    getTitle() { return 'Магические предметы'; }

    async mountSvelteComponent(element: Element): Promise<unknown> {
        const filterConfig: FilterConfig<ArtifactoryFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'types', label: 'Типы' },
            { key: 'rarities', label: 'Редкость' },
        ];

        return mount(BaseSidePanelUi, {
            target: element,
            props: {
                panelKey: this.getKey(),
                redesignEnabled: this.plugin.getSettings().redesignEnabled,
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<ArtifactoryFilters>(['types', 'sources', 'rarities']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: Group<SmallArtifact>) => {
                    const title = rarityGroupTitles[group.sort] ?? group.smallItems[0]?.rarity.name ?? group.sort;
                    return title.charAt(0).toUpperCase() + title.slice(1);
                },
                FullItemSlot: ArtifactFullUi,
                SmallItemSlot: ArtifactSmallUi,
                paginated: true,
                pageSize: 50,
            },
        });
    }
}
