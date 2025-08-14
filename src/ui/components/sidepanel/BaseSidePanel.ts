import { ItemView, type WorkspaceLeaf } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Filters } from "src/domain/models/common/Filters";
import type { WithUrl } from "src/domain/models/common/WithUrl";
import type { Repository } from "src/domain/repositories/Repository";
import type DndStatblockPlugin from "src/main";

export abstract class BaseSidePanel<ST extends WithUrl, FT extends ST, F extends Filters> {

    abstract getKey(): string;
    abstract getRibbonIconName(): string;
    abstract getTitle(): string;

    abstract mountSvelteComponent(element: Element): Promise<void>;

    private viewId = `obsidian-dnd-statblock-side-panel-${this.getKey()}`;
    public fullItem: FT | undefined = undefined;
    private sidePanelItemView: SidePanelItemView<ST, FT, F>;

    constructor(
        public plugin: DndStatblockPlugin,
        public repository: Repository<ST, FT, F>,
        public uiEventListener: IUiEventListener,
    ) {}

    register() {
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
        this.plugin.addRibbonIcon(this.getRibbonIconName(), this.getTitle(), async () => this.open(undefined));
    }

    async open(fullItem: FT | undefined) {
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
        return sidePanelView;
    }
}

class SidePanelItemView<ST extends WithUrl, FT extends ST, F extends Filters> extends ItemView {

    constructor(
        leaf: WorkspaceLeaf,
        private viewId: string,
        private title: string,
        private ribbonIconName: string,
        private onMountSvelteComponent: (target: Element) => Promise<void>,
    ) {
        super(leaf);
    }

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
        container.empty();
        await this.onMountSvelteComponent(container);
    }

    async onClose() {}
}
