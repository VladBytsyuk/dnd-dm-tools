import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import { mount } from "svelte";
import DndStatblockPlugin from "src/main";
import { type IBestiary } from "src/data/bestiary";
import type { UiEventListener } from "src/data/ui_event_listener";
import type { FullMonster } from "src/domain/monster";
import BestiarySidePanelUi from "src/ui/layout/sidepanel/BestiarySidePanelUi.svelte";
import { TEXTS } from "src/res/texts_ru";

export function registerSidePanelBestiary(
    plugin: DndStatblockPlugin,
    bestiary: IBestiary,
    uiEventListener: UiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_BESTIARY_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelBestiaryView(leaf, plugin, bestiary, uiEventListener),
    );
    plugin.addRibbonIcon("skull", TEXTS.ribbonActionBestiaryTitle, async (mouseEvent) => {
        openSidePanelBestiary(plugin.app.workspace, undefined);
    });
}

let sidePanelFullMonster: FullMonster | undefined = undefined;

const SIDE_PANEL_BESTIARY_VIEW = "obsidian-dnd-statblock-side-panel-bestiary";

class SidePanelBestiaryView extends ItemView {
    
    // ---- fields ----
    #plugin: DndStatblockPlugin;
    #bestiary: IBestiary;
    #uiEventListener: UiEventListener;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        bestiary: IBestiary,    
        uiEventListener: UiEventListener,

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
        return TEXTS.sidePanelBestiaryTitle;
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
