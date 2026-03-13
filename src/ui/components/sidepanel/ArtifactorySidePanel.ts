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

export class ArtifactorySidePanel extends BaseSidePanel<SmallArtifact, FullArtifact, ArtifactoryFilters>{

    getKey() { return 'artifactory'; }
    getRibbonIconName() { return 'wand'; }
    getTitle() { return 'Магические предметы'; }

    async mountSvelteComponent(element: Element): Promise<void> {
        const filterConfig: FilterConfig<ArtifactoryFilters>[] = [
            { key: 'sources', label: 'Источник' },
            { key: 'types', label: 'Типы' },
            { key: 'rarities', label: 'Редкость' },
        ];

        mount(BaseSidePanelUi, {
            target: element,
            props: {
                initialFullItem: this.fullItem,
                initialFilters: emptyFilters<ArtifactoryFilters>(['types', 'sources', 'rarities']),
                repository: this.repository,
                uiEventListener: this.uiEventListener,
                filterConfig,
                groupTitleBuilder: (group: { sort: string }) => group.sort,
                FullItemSlot: ArtifactFullUi,
                SmallItemSlot: ArtifactSmallUi,
            },
        });
    }
}
