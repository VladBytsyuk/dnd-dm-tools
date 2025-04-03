import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import type { Spellbook } from "src/data/spellbook";
import { SpellSuggester } from "../suggest/spell_suggester";
import type { SpellLayoutManager } from "../settings/spell_layout_manager";

export function registerSidePanelSpellbook(
    plugin: DndStatblockPlugin,
    spellbook: Spellbook,
    layoutManager: SpellLayoutManager,
) {
    plugin.registerView(
        SIDE_PANEL_SPELLBOOK_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelSpellbookView(leaf, plugin, spellbook, layoutManager),
    );
    plugin.addRibbonIcon("sparkles", TEXTS.ribbonActionSpellbookTitle, async (mouseEvent) => {
        openSidePanelSpellbook(mouseEvent.getModifierState("Meta"), plugin.app.workspace)
    });
}

const SIDE_PANEL_SPELLBOOK_VIEW = "obsidian-dnd-statblock-side-panel-spellbook";

class SidePanelSpellbookView extends ItemView {
    
    // ---- fields ----
    #plugin: DndStatblockPlugin;
    #spellbook: Spellbook;
    #layoutManager: SpellLayoutManager;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        spellbook: Spellbook,
        layoutManager: SpellLayoutManager,
    ) {
        super(leaf);
        this.#plugin = plugin;
        this.#spellbook = spellbook;
        this.#layoutManager = layoutManager;
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_SPELLBOOK_VIEW;
    }

    getDisplayText() {
        return TEXTS.sidePanelSpellbookTitle;
    }

    getIcon(): string {
        return "sparkles";
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
        
        const headerEl = container.createDiv(`side-panel-spellbook-header`);

        const searchEl = new SearchComponent(headerEl).setPlaceholder(TEXTS.spellbookSearchPlaceholder);
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
        statblockContainer.addClass('side-panel-spellbook-statblock-container');
        container.appendChild(statblockContainer);
        
        const suggester = new SpellSuggester(this.#plugin.app, searchEl, this.#spellbook);
        suggester.onSelectSpell(fullSpell => {
            statblockContainer.empty();
            this.#layoutManager.renderLayout(statblockContainer, fullSpell);
            suggester.close();
        });
    }
}

async function openSidePanelSpellbook(isSidePanelOpened: boolean = false, workspace: Workspace) {

    let leaf: WorkspaceLeaf;
    const sidePanelLeaves = workspace.getLeavesOfType(SIDE_PANEL_SPELLBOOK_VIEW);

    if (sidePanelLeaves?.length) {
        leaf = sidePanelLeaves[0];
    } else {
        leaf = workspace.getRightLeaf(true)!!;
    }

    await leaf.setViewState({
        type: SIDE_PANEL_SPELLBOOK_VIEW
    });

    workspace.revealLeaf(leaf);
    return leaf.view as SidePanelSpellbookView;
}
