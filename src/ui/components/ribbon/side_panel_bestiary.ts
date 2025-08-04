import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import { mount } from "svelte";
import DndStatblockPlugin from "src/main";
import BestiarySidePanelUi from "src/ui/layout/sidepanel/BestiarySidePanelUi.svelte";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Bestiary } from "src/domain/repositories/Bestiary";
import type { FullMonster } from "src/domain/models/monster/FullMonster";

export function registerSidePanelBestiary(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    uiEventListener: IUiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_BESTIARY_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelBestiaryView(leaf, plugin, bestiary, uiEventListener),
    );
    plugin.addRibbonIcon("skull", "Бестиарий", async () => {
        openSidePanelBestiary(plugin.app.workspace, undefined);
    });
}

let sidePanelFullMonster: FullMonster | undefined = undefined;

const SIDE_PANEL_BESTIARY_VIEW = "obsidian-dnd-statblock-side-panel-bestiary";

class SidePanelBestiaryView extends ItemView {
    
    // ---- fields ----
    #plugin: DndStatblockPlugin;
    #bestiary: Bestiary;
    #uiEventListener: IUiEventListener;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        bestiary: Bestiary,    
        uiEventListener: IUiEventListener,

    ) {
        super(leaf);
        this.#plugin = plugin;
        this.#bestiary = bestiary;
        this.#uiEventListener = uiEventListener;
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_BESTIARY_VIEW;
    }

    getDisplayText() {
        return "Бестиарий";
    }

    getIcon(): string {
        return "skull";
    }

    async onOpen() {
        const container = this.containerEl.children[1];

        container.empty();
        mount(BestiarySidePanelUi, {     
            target: container,
            props: {
                plugin: this.#plugin,
                bestiary: this.#bestiary,
                initialFullMonster: sidePanelFullMonster,
                uiEventListener: this.#uiEventListener,
            },  
        });
    }

    async onClose() {
    }
}

export async function openSidePanelBestiary(
    workspace: Workspace,
    fullMonster: FullMonster | undefined,
) {
    sidePanelFullMonster = fullMonster;

    let leaf: WorkspaceLeaf;
    const sidePanelLeaves = workspace.getLeavesOfType(SIDE_PANEL_BESTIARY_VIEW);

    if (sidePanelLeaves?.length) {
        leaf = sidePanelLeaves[0];
    } else {
        leaf = workspace.getRightLeaf(true)!!;
    }

    await leaf.setViewState({
        type: SIDE_PANEL_BESTIARY_VIEW
    });

    workspace.revealLeaf(leaf);

    const sidePanelBestiaryView = leaf.view as SidePanelBestiaryView;
    await sidePanelBestiaryView.onOpen();
    return sidePanelBestiaryView;
}
