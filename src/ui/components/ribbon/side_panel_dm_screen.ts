import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import type { DmScreen } from "src/data/dm_screen";
import type { DmScreenGroup } from "src/domain/dm_screen_group";
import type { DmScreenItem } from "src/domain/dm_screen_item";
import type DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import DmScreenUi from "src/ui/layout/sidepanel/DmScreenUi.svelte";
import { mount } from "svelte";

export function registerSidePanelDmScreen(
    plugin: DndStatblockPlugin,
    dmScreen: DmScreen,
) {
    plugin.registerView(
        SIDE_PANEL_DM_SCREEN_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelDmScreenView(leaf, dmScreen),
    );
    plugin.addRibbonIcon("book-open", TEXTS.ribbonActionDmScreenTitle, async (mouseEvent) => {
        openSidePanelDmScreen(plugin.app.workspace, undefined);
    });
}

let sidePanelScreenItem: DmScreenItem | undefined = undefined;

const SIDE_PANEL_DM_SCREEN_VIEW = "obsidian-dnd-statblock-side-panel-dm-screen";

class SidePanelDmScreenView extends ItemView {

    // ---- fields ----   
    #dmScreen: DmScreen;

    // ---- constructor ----
    constructor(
        leaf: WorkspaceLeaf, 
        dmScreen: DmScreen,
    ) {
        super(leaf);
        this.#dmScreen = dmScreen;
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_DM_SCREEN_VIEW;
    }

    getDisplayText() {
        return TEXTS.sidePanelDmScreenTitle;
    }

    getIcon() {
        return "book-open";
    } 

    async onOpen() {
        const rootGroup = await this.#dmScreen.getRootGroup();    

        const container = this.containerEl.children[1];
        container.empty();
        mount(DmScreenUi, { 
            target: container, 
            props: { 
                rootGroup: rootGroup,
                screenItem: sidePanelScreenItem,
                loadScreenItem: async (group: DmScreenGroup) => await this.#dmScreen.getScreenItemByUrl(group.url),
            }
        });
    }

    async onClose() {           
    }
}

export async function openSidePanelDmScreen(
    workspace: Workspace,
    screenItem: DmScreenItem | undefined,
): Promise<SidePanelDmScreenView> {
    sidePanelScreenItem = screenItem;

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
