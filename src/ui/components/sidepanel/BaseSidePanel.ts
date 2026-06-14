import { ItemView, type WorkspaceLeaf } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { BaseItem } from "src/domain/models/common/BaseItem";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";
import type { PanelHost, PanelSearchResult } from "./PanelHost";
import type { PanelKey } from "src/domain/settings/PluginSettings";
import { unmount } from "svelte";

export abstract class BaseSidePanel<ST extends BaseItem, FT extends ST, F extends Filters> implements PanelHost {

    abstract getKey(): PanelKey;
    abstract getRibbonIconName(): string;
    abstract getTitle(): string;

    abstract mountSvelteComponent(element: Element): Promise<unknown>;

    private viewId = `obsidian-dnd-statblock-side-panel-${this.getKey()}`;
    public fullItem: FT | undefined = undefined;
    private sidePanelItemView: SidePanelItemView<ST, FT, F>;

    constructor(
        public plugin: DndStatblockPlugin,
        public repository: Repository<ST, FT, F>,
        public uiEventListener: IUiEventListener,
    ) {}

    getViewId(): string {
        return this.viewId;
    }

    registerView() {
        this.plugin.registerView(
            this.viewId,
            (leaf: WorkspaceLeaf) => {
                this.sidePanelItemView = new SidePanelItemView<ST, FT, F>(
                    leaf,
                    this.viewId,
                    this.getTitle(),
                    this.getRibbonIconName(),
                    async (target: Element) => await this.mountSvelteComponent(target),
                )
                return this.sidePanelItemView;
            },
        );
    }

    addRibbonIcon(): HTMLElement {
        return this.plugin.addRibbonIcon(
            this.getRibbonIconName(),
            this.getTitle(),
            async () => this.plugin.panelManager.openPanel(this.getKey()),
        );
    }

    async open(fullItem: FT | undefined) {
        await this.plugin.panelManager.openItem(this.getKey(), fullItem);
    }

    async openSeparate(fullItem: FT | undefined): Promise<void> {
        this.fullItem = fullItem;

        let leaf: WorkspaceLeaf;
        const sidePanelLeaves = this.plugin.app.workspace.getLeavesOfType(this.viewId);

        if (sidePanelLeaves?.length) {
            leaf = sidePanelLeaves[0];
        } else {
            leaf = this.plugin.app.workspace.getRightLeaf(true)!!;
        }

        await leaf.setViewState({
            type: this.viewId,
        });

        this.plugin.app.workspace.revealLeaf(leaf);

        const sidePanelView = leaf.view as SidePanelItemView<ST, FT, F>;
        await sidePanelView.onOpen();
        void sidePanelView;
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

class SidePanelItemView<ST extends BaseItem, FT extends ST, F extends Filters> extends ItemView {

    constructor(
        leaf: WorkspaceLeaf,
        private viewId: string,
        private title: string,
        private ribbonIconName: string,
        private onMountSvelteComponent: (target: Element) => Promise<unknown>,
    ) {
        super(leaf);
    }

    private component: unknown;

    getViewType(): string {
        return this.viewId;
    }

    getDisplayText(): string {
        return this.title;
    }

    getIcon(): string {
        return this.ribbonIconName;
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        if (this.component) unmount(this.component);
        container.empty();
        this.component = await this.onMountSvelteComponent(container);
    }

    async onClose() {
        if (this.component) unmount(this.component);
        this.component = undefined;
    }
}
