import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import type { DmScreenItem } from "src/domain/dm_screen_group";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { DmScreen } from "src/domain/repositories/DmScreen";
import type DndStatblockPlugin from "src/main";
import DmScreenSidePanelUi from "src/ui/layout/sidepanel/DmScreenSidePanelUi.svelte";
import { mount } from "svelte";

export function registerSidePanelDmScreen(
    plugin: DndStatblockPlugin,
    dmScreen: DmScreen,
    uiEventListener: IUiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_DM_SCREEN_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelDmScreenView(leaf, dmScreen, uiEventListener),
    );
    plugin.addRibbonIcon("book-open", "Ширма", async () => {
        openSidePanelDmScreen(plugin.app.workspace, undefined);
    });
}

let sidePanelScreenGroup: DmScreenItem | undefined = undefined;    

const SIDE_PANEL_DM_SCREEN_VIEW = "obsidian-dnd-statblock-side-panel-dm-screen";

class SidePanelDmScreenView extends ItemView {

    // ---- fields ----   
    #dmScreen: DmScreen;
    #uiEventListener: IUiEventListener;

    // ---- constructor ----
    constructor(
        leaf: WorkspaceLeaf, 
        dmScreen: DmScreen,
        uiEventListener: IUiEventListener,
    ) {
        super(leaf);
        this.#dmScreen = dmScreen;
        this.#uiEventListener = uiEventListener;
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_DM_SCREEN_VIEW;
    }

    getDisplayText() {
        return "Ширма";
    }

    getIcon() {
        return "book-open";
    } 

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        mount(DmScreenSidePanelUi, { 
            target: container, 
            props: {
                item: sidePanelScreenGroup,
                children: await this.#dmScreen.getAllRootItems(),
                uiEventListener: this.#uiEventListener,
                getFilteredItems: async (name: string) => await this.#dmScreen.getFilteredItems(name),
                getChildrenCount: async (item: DmScreenItem) => await this.#dmScreen.getChildrenCount(item),
                getChildren: async (item: DmScreenItem) => await this.#dmScreen.getChildren(item),
                getFullItem: async (item: DmScreenItem) => await this.#dmScreen.getFullItem(item),
            }
        });
    }

    async onClose() {           
    }
}

export async function openSidePanelDmScreen(
    workspace: Workspace,
    screenGroup: DmScreenItem | undefined,
): Promise<SidePanelDmScreenView> {
    sidePanelScreenGroup = screenGroup;

    let leaf: WorkspaceLeaf;
    const sidePanelLeaves = workspace.getLeavesOfType(SIDE_PANEL_DM_SCREEN_VIEW);

    if (sidePanelLeaves?.length) {
        leaf = sidePanelLeaves[0];
    } else {
        leaf = workspace.getRightLeaf(true)!!;
    }

    await leaf.setViewState({
        type: SIDE_PANEL_DM_SCREEN_VIEW
    });

    workspace.revealLeaf(leaf);

    const sidePanelDmScreenView = leaf.view as SidePanelDmScreenView;  
    await sidePanelDmScreenView.onOpen();
    return sidePanelDmScreenView;
}
