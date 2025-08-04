import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import DndStatblockPlugin from "src/main";
import InitiativeTracker from 'src/ui/layout/tracker/InitiativeTracker.svelte';
import { mount, unmount } from 'svelte';

export function registerSidePanelInitiativeTracker(
    plugin: DndStatblockPlugin,
    uiEventListener: IUiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_INITIATIVE_TRACKER_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelInitiativeTrackerView(leaf, plugin, uiEventListener),
    );
    plugin.addRibbonIcon("swords", "Трекер инициативы", async () => {
        openSidePanelInitiativeTracker(plugin.app.workspace)
    });
}

const SIDE_PANEL_INITIATIVE_TRACKER_VIEW = "obsidian-dnd-statblock-side-panel-initiative-tracker";

class SidePanelInitiativeTrackerView extends ItemView {
    
    // ---- fields ----
    #component: ReturnType<typeof InitiativeTracker> | undefined;

    constructor(leaf: WorkspaceLeaf, private plugin: DndStatblockPlugin, private uiEventListener: IUiEventListener) {
        super(leaf);
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_INITIATIVE_TRACKER_VIEW;
    }

    getDisplayText() {
        return "Трекер инициативы";
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
                app: this.plugin.app,
                encounter: emptyEncounter,
                isEditable: true,
                onPortraitClick: () => this.uiEventListener.onBeastClick.bind(this.uiEventListener),
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
