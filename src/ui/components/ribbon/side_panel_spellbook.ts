import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import DndStatblockPlugin from "src/main";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import { mount } from "svelte";
import SpellbookSidePanelUi from "src/ui/layout/sidepanel/SpellbookSidePanelUi.svelte";
import type { IUiEventListener } from "src/domain/listeners/ui_event_listener";
import type { Spellbook } from "src/domain/repositories/Spellbook";
import type { SpellbookFilters } from "src/domain/models/spell/SpellbookFilters";
import { SpellbookFiltersModal } from "../modals/spellbook_filers_modal";

export function registerSidePanelSpellbook(
    plugin: DndStatblockPlugin,
    spellbook: Spellbook,
    uiEventListener: IUiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_SPELLBOOK_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelSpellbookView(leaf, plugin, spellbook, uiEventListener),
    );
    plugin.addRibbonIcon("sparkles", "Книга заклинаний", async () => {
        openSidePanelSpellbook(plugin.app.workspace, undefined);
    });
}

let sidePanelFullSpell: FullSpell | undefined = undefined;

const SIDE_PANEL_SPELLBOOK_VIEW = "obsidian-dnd-statblock-side-panel-spellbook";

class SidePanelSpellbookView extends ItemView {
    
    // ---- fields ----
    #plugin: DndStatblockPlugin;
    #spellbook: Spellbook;
    #uiEventListener: IUiEventListener;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        spellbook: Spellbook,
        uiEventListener: IUiEventListener,
    ) {
        super(leaf);
        this.#plugin = plugin;
        this.#spellbook = spellbook;
        this.#uiEventListener = uiEventListener;
    }

    // ---- callbacks ----
    getViewType() {
        return SIDE_PANEL_SPELLBOOK_VIEW;
    }

    getDisplayText() {
        return "Книга заклинаний";
    }

    getIcon(): string {
        return "sparkles";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        
        container.empty();
        mount(SpellbookSidePanelUi, {
            target: container,
            props: {
                initialFullItem: sidePanelFullSpell,
                repository: this.#spellbook,
                uiEventListener: this.#uiEventListener,
                openFiltersModal: (fullFilters: SpellbookFilters, filters: SpellbookFilters, onApply: (newFilters: SpellbookFilters) => Promise<void>) => {
                    new SpellbookFiltersModal(this.#plugin.app, fullFilters, filters, onApply).open();
                },
            },
        });
    }

    async onClose() {
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
