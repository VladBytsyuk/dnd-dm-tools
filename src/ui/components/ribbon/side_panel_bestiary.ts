import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { TEXTS } from "src/res/texts_ru";
import { MonsterSuggester } from "src/ui/components/suggest/monster_suggester";
import { MonsterLayoutManager } from "../settings/monster_layout_manager";
import type { FullMonster } from "src/domain/monster";

export function registerSidePanelBestiary(
    plugin: DndStatblockPlugin,
    bestiary: Bestiary,
    layoutManager: MonsterLayoutManager,
) {
    plugin.registerView(
        SIDE_PANEL_BESTIARY_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelBestiaryView(leaf, plugin, bestiary, layoutManager),
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
    #bestiary: Bestiary;
    #layoutManager: MonsterLayoutManager;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        bestiary: Bestiary,
        layoutManager: MonsterLayoutManager,
    ) {
        super(leaf);
        this.#plugin = plugin;
        this.#bestiary = bestiary;
        this.#layoutManager = layoutManager;
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

        const searchEl = new SearchComponent(headerEl).setPlaceholder(TEXTS.bestiarySearchPlaceholder);
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
            this.#layoutManager.renderLayout(statblockContainer, fullMonster);
            suggester.close();
        });
        if (sidePanelFullMonster) {
            statblockContainer.empty();
            this.#layoutManager.renderLayout(statblockContainer, sidePanelFullMonster);
        }
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
