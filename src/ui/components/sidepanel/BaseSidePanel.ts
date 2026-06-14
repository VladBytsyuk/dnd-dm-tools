import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import type { PanelHost, PanelSearchResult } from "./PanelHost";
import type { PanelKey } from "src/domain/models/assistant/AssistantWorkspace";

export abstract class BaseSidePanel<ST extends BaseItem, FT extends ST, F extends Filters> implements PanelHost {

    abstract getKey(): PanelKey;
    abstract getRibbonIconName(): string;
    abstract getTitle(): string;

    abstract mountSvelteComponent(element: Element): Promise<unknown>;

    public fullItem: FT | undefined = undefined;

    constructor(
        public plugin: DndStatblockPlugin,
        public repository: Repository<ST, FT, F>,
        public uiEventListener: IUiEventListener,
    ) {}

    async open(fullItem: FT | undefined) {
        await this.plugin.panelManager.openItem(this.getKey(), fullItem);
    }

    async mount(element: Element, item?: BaseItem): Promise<unknown> {
        this.fullItem = item as FT | undefined;
        return await this.mountSvelteComponent(element);
    }

    async search(query: string): Promise<PanelSearchResult[]> {
        const items = await this.repository.getFilteredSmallItems(query, null);
        return items.slice(0, 25).map((item) => ({
            panelKey: this.getKey(),
            url: item.url,
            title: item.name.rus || item.name.eng,
            subtitle: item.name.eng && item.name.eng !== item.name.rus ? item.name.eng : "",
        }));
    }

    async resolveItem(url: string): Promise<FT | null> {
        return await this.repository.getFullItemByUrl(url);
    }
}
