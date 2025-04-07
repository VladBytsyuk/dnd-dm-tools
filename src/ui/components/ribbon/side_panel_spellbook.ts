import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import type { Spellbook } from "src/data/spellbook";
import { SpellSuggester } from "../suggest/spell_suggester";
import type { SpellLayoutManager } from "../settings/spell_layout_manager";
import type { FullSpell } from "src/domain/spell";

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
        openSidePanelSpellbook(plugin.app.workspace, undefined);
    });
}

let sidePanelFullSpell: FullSpell | undefined = undefined;

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
            spellContainer.empty();
            suggester.close();
        });

        const clearButton = new ButtonComponent(headerEl).setIcon("eraser");
        clearButton.onClick((evt) => {
            searchEl.setValue("");
            spellContainer.empty();
            suggester.close();
        })

        const spellContainer = document.createElement('div');
        spellContainer.addClass('side-panel-spellbook-statblock-container');
        container.appendChild(spellContainer);
        
        const suggester = new SpellSuggester(this.#plugin.app, searchEl, this.#spellbook);
        suggester.onSelectSpell(fullSpell => {
            spellContainer.empty();
            this.#layoutManager.renderLayout(spellContainer, fullSpell);
            suggester.close();
        });
        if (sidePanelFullSpell) {
            spellContainer.empty();
            this.#layoutManager.renderLayout(spellContainer, sidePanelFullSpell);
        }
    }
}

export async function openSidePanelSpellbook(
    workspace: Workspace, 
    fullSpell: FullSpell | undefined,
) {
    sidePanelFullSpell = fullSpell;

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

    const sidePanelSpellbookView = leaf.view as SidePanelSpellbookView;
    await sidePanelSpellbookView.onOpen();
    return sidePanelSpellbookView;
}
