import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import type { DmScreen } from "src/data/dm_screen";
import type DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";

export function registerSidePanelDmScreen(
    plugin: DndStatblockPlugin,
    dmScreen: DmScreen,
) {
    plugin.registerView(
        SIDE_PANEL_DM_SCREEN_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelDmScreenView(leaf, plugin, dmScreen),
    );
    plugin.addRibbonIcon("book-open", TEXTS.ribbonActionDmScreenTitle, async (mouseEvent) => {
        openSidePanelDmScreen(plugin.app.workspace, undefined);
    });
}

const SIDE_PANEL_DM_SCREEN_VIEW = "obsidian-dnd-statblock-side-panel-dm-screen";

class SidePanelDmScreenView extends ItemView {

    // ---- fields ----
    #plugin: DndStatblockPlugin;    
    #dmScreen: DmScreen;            
    #contentContainer: HTMLElement | undefined = undefined;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        dmScreen: DmScreen,
    ) {
        super(leaf);
        this.#plugin = plugin;
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
        const container = this.containerEl.children[1];
        await this.#fillContainer(container);
    }
    async onClose() {           
        this.#contentContainer?.empty();
        this.#contentContainer = undefined;
    }

    // ---- private methods ----
    async #fillContainer(container: Element) {
        container.empty();
    }
}

export async function openSidePanelDmScreen(
    workspace: Workspace,
): Promise<SidePanelDmScreenView> {

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
