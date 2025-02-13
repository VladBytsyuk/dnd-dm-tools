import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { FullMonster } from "src/domain/monster";
import { TEXTS } from "src/res/texts";
import { MonsterSuggester } from "src/suggest/monster_suggester";
import { renderLayout5e } from "./layout/layout_5e";

export function registerSidePanelBestiary(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
) {
    plugin.registerView(
        SIDE_PANEL_BESTIARY_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelBestiaryView(leaf, plugin, bestiary)
    );
    plugin.addRibbonIcon("skull", TEXTS.ribbonActionTitle, async (mouseEvent) => {
        openSidePanelBestiary(mouseEvent.getModifierState("Meta"), plugin.app.workspace)
    });
}

const SIDE_PANEL_BESTIARY_VIEW = "obsidian-dnd-statblock-side-panel-bestiary";

class SidePanelBestiaryView extends ItemView {
    
    // ---- fields ----
    #plugin: DndStatblockPlugin;
    #bestiary: Bestiary;

    constructor(leaf: WorkspaceLeaf, plugin: DndStatblockPlugin, bestiary: Bestiary) {
        super(leaf);
        this.#plugin = plugin;
        this.#bestiary = bestiary;
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
        this.#fillContainer(container);
    }

    async onClose() {
        // Nothing to clean up.
    }

    // ---- private methods ----
    #fillContainer(container: Element) {
        container.empty();
        
        const headerEl = container.createDiv(`side-panel-bestiary-header`);
        const searchEl = new SearchComponent(headerEl).setPlaceholder(TEXTS.sidePanelBestiarySearchPlaceholder);
        
        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            statblockContainer.empty();
            suggester.close();
        });
        const clearButton = new ButtonComponent(headerEl).setIcon("eraser");
        clearButton.onClick((evt) => {
            searchEl.setValue("");
            statblockContainer.empty();
            suggester.close();
        })

        const statblockContainer = document.createElement('div');
        statblockContainer.addClass('side-panel-bestiary-statblock-container');
        container.appendChild(statblockContainer);
        
        const suggester = new MonsterSuggester(this.#plugin.app, searchEl, this.#bestiary);
        suggester.onSelectMonster(fullMonster => {
            statblockContainer.empty();
            renderLayout5e(statblockContainer, fullMonster);
            suggester.close();
        });
    }
}

async function openSidePanelBestiary(isSidePanelOpened: boolean = false, workspace: Workspace) {

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
    return leaf.view as SidePanelBestiaryView;
}
