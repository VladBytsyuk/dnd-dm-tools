import { ItemView, Workspace, type WorkspaceLeaf } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import type { ISpellbook } from "src/data/spellbook";
import type { FullSpell } from "src/domain/spell";
import { mount } from "svelte";
import type { UiEventListener } from "src/data/ui_event_listener";
import SpellbookSidePanelUi from "src/ui/layout/sidepanel/SpellbookSidePanelUi.svelte";

export function registerSidePanelSpellbook(
    plugin: DndStatblockPlugin,
    spellbook: ISpellbook,
    uiEventListener: UiEventListener,
) {
    plugin.registerView(
        SIDE_PANEL_SPELLBOOK_VIEW,
        (leaf: WorkspaceLeaf) => new SidePanelSpellbookView(leaf, plugin, spellbook, uiEventListener),
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
    #spellbook: ISpellbook;
    #uiEventListener: UiEventListener;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        spellbook: ISpellbook,
        uiEventListener: UiEventListener,
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
        return TEXTS.sidePanelSpellbookTitle;
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
                plugin: this.#plugin,
                spellbook: this.#spellbook,
                initialFullSpell: sidePanelFullSpell,
                uiEventListener: this.#uiEventListener,
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
