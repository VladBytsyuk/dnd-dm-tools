import { 
    ItemView, 
    Workspace, 
    type WorkspaceLeaf, 
    SearchComponent,
} from "obsidian";
import { Bestiary } from "src/data/bestiary";
import { FullMonster } from "src/domain/monster";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts";
import { MonsterSuggester } from "src/suggest/monster_suggester";

export const SIDE_PANEL_BESTIARY_VIEW = "obsidian-dnd-statblock-side-panel-bestiary";

export class SidePanelBestiaryView extends ItemView {
    
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
        
        const headerEl = container.createDiv(`obsidian-dnd-statblock-side-panel-bestiary-header`);
        const searchEl = new SearchComponent(headerEl).setPlaceholder(TEXTS.sidePanelBestiarySearchPlaceholder);
        const suggester = new MonsterSuggester(this.#plugin.app, searchEl, this.#bestiary);
        suggester.onSelectMonster(fullMonster => this.#render(fullMonster));
    }

    async #render(monster: Partial<FullMonster>) {
        console.log(`render monster: ${monster.name?.rus} + ${monster.hits?.average}`)
    }
}

export async function openSidePanelBestiary(isSidePanelOpened: boolean = false, workspace: Workspace) {

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
