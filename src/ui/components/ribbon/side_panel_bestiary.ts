import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { TEXTS } from "src/res/texts_ru";
import { MonsterSuggester } from "src/ui/components/suggest/monster_suggester";
import { MonsterLayoutManager } from "../settings/monster_layout_manager";
import type { FullMonster } from "src/domain/monster";
import { BestiaryFiltersModal } from "../modals/bestiary_filers_modal";
import { BestiaryFilter } from "src/domain/bestiary_filters";
import { stat } from "fs";
import { mount } from "svelte";
import BestiarySmall from "src/ui/layout/bestiary/BestiarySmall.svelte";
import BestiaryGroup from "src/ui/layout/bestiary/BestiaryGroup.svelte";

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
    #filters: BestiaryFilter = BestiaryFilter([], [], []);

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
        await this.#fillContainer(container);
    }

    async onClose() {
        // Nothing to clean up.
    }

    // ---- private methods ----
    async #fillContainer(container: Element) {
        container.empty();

        const fullFilters = await this.#bestiary.getAllFilters();
        
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
        });

        const filtersButton = new ButtonComponent(headerEl)
            .setIcon("sliders-horizontal")
            .setClass("side-panel-filter-item");
        filtersButton.onClick((evt) => {
            if (!fullFilters) return;
            new BestiaryFiltersModal(
                this.#plugin.app, 
                fullFilters,
                this.#filters, 
                (filters) => {
                    statblockContainer.empty();
                    this.#filters = filters;
                    this.#addSmallMonsters(statblockContainer);
                },
            ).open();
        });

        const statblockContainer = document.createElement('div');
        statblockContainer.addClass('side-panel-bestiary-statblock-container');
        container.appendChild(statblockContainer);
        
        const suggester = new MonsterSuggester(this.#plugin.app, searchEl, this.#bestiary);
        suggester.onSelectMonster(fullMonster => {
            statblockContainer.empty();
            this.#layoutManager.renderLayout(statblockContainer, fullMonster);
            suggester.close();
        });

        await this.#addSmallMonsters(statblockContainer);

        if (sidePanelFullMonster) {
            statblockContainer.empty();
            this.#layoutManager.renderLayout(statblockContainer, sidePanelFullMonster);
        }
    }

    async #addSmallMonsters(container: HTMLElement) {
        const smallMonsters = await this.#bestiary.getFilteredSmallMonsters(this.#filters);
        if (smallMonsters.length === 0) {
            container.createDiv("no-monsters").setText("No monsters");
            return;
        }

        const groupedMonsters = smallMonsters.reduce((groups, monster) => {
            const { challengeRating } = monster;
            if (!groups[challengeRating]) {
                groups[challengeRating] = [];
            }
            groups[challengeRating].push(monster);
            return groups;
        }, {} as Record<string, typeof smallMonsters>);

        for (const [challengeRating, monsters] of Object.entries(groupedMonsters)) {
            mount(BestiaryGroup, {
                target: container,
                props: {
                    challengeRating: challengeRating,
                    smallMonsters: monsters,
                },
            });
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
