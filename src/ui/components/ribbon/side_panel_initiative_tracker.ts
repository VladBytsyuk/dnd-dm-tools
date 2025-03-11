import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import InitiativeTracker from 'src/ui/layout/tracker/InitiativeTracker.svelte';
import { mount, unmount } from 'svelte';

export function registerSidePanelInitiativeTracker(
    plugin: DndStatblockPlugin,
) {
    plugin.registerView(
        SIDE_PANEL_INITIATIVE_TRACKER_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelInitiativeTrackerView(leaf),
    );
    plugin.addRibbonIcon("swords", TEXTS.ribbonActionInitiativeTrackerTitle, async (mouseEvent) => {
        openSidePanelInitiativeTracker(plugin.app.workspace)
    });
}

const SIDE_PANEL_INITIATIVE_TRACKER_VIEW = "obsidian-dnd-statblock-side-panel-initiative-tracker";

class SidePanelInitiativeTrackerView extends ItemView {
    
    // ---- fields ----
    #component: ReturnType<typeof InitiativeTracker> | undefined;

    constructor(leaf: WorkspaceLeaf) {
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
        const emptyEncounter = {
            name: "",
            participants: [],
        }
        this.#component = mount(InitiativeTracker, {
            target: container,
            props: {
                encounter: emptyEncounter,
                onUpdate: () => {},
            }
        });
    }
}

async function openSidePanelInitiativeTracker(workspace: Workspace) {
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
    return leaf.view as SidePanelInitiativeTrackerView;
}
