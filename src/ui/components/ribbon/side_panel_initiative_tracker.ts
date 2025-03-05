import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { TEXTS } from "src/res/texts_ru";
import { LayoutManager } from "../settings/layout_manager";
import InitiativeTracker from 'src/ui/layout/tracker/InitiativeTracker.svelte';
import { mount, unmount } from 'svelte';

export function registerSidePanelInitiativeTracker(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    layoutManager: LayoutManager,
) {
    plugin.registerView(
        SIDE_PANEL_INITIATIVE_TRACKER_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelInitiativeTrackerView(leaf, plugin, bestiary, layoutManager),
    );
    plugin.addRibbonIcon("swords", TEXTS.ribbonActionInitiativeTrackerTitle, async (mouseEvent) => {
        openSidePanelInitiativeTracker(mouseEvent.getModifierState("Meta"), plugin.app.workspace)
    });
}

const SIDE_PANEL_INITIATIVE_TRACKER_VIEW = "obsidian-dnd-statblock-side-panel-initiative-tracker";

class SidePanelInitiativeTrackerView extends ItemView {
    
    // ---- fields ----
    #component: ReturnType<typeof InitiativeTracker> | undefined;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        bestiary: Bestiary,
        layoutManager: LayoutManager,
    ) {
        super(leaf);
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_INITIATIVE_TRACKER_VIEW;
    }

    getDisplayText() {
        return TEXTS.sidePanelInitiativeTrackerTitle;
    }

    getIcon(): string {
        return "swords";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        this.#fillContainer(container);
    }

    async onClose() {
        if (this.#component) {
            unmount(this.#component);
            this.#component = undefined;
        }
    }

    // ---- private methods ----
    #fillContainer(container: Element) {
        container.empty();
        this.#component = mount(InitiativeTracker, {
            target: container,
        });
    }
}

async function openSidePanelInitiativeTracker(isSidePanelOpened: boolean = false, workspace: Workspace) {

    let leaf: WorkspaceLeaf;
    const sidePanelLeaves = workspace.getLeavesOfType(SIDE_PANEL_INITIATIVE_TRACKER_VIEW);

    if (sidePanelLeaves?.length) {
        leaf = sidePanelLeaves[0];
    } else {
        leaf = workspace.getRightLeaf(true)!!;
    }

    await leaf.setViewState({
        type: SIDE_PANEL_INITIATIVE_TRACKER_VIEW
    });

    workspace.revealLeaf(leaf);
    return leaf.view as SidePanelBestiaryView;
}
