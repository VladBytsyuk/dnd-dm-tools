import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { Bestiary } from "src/data/bestiary";
import { TEXTS } from "src/res/texts_ru";
import { MonsterLayoutManager } from "../settings/monster_layout_manager";
import type { FullMonster, SmallMonster } from "src/domain/monster";
import { BestiaryFiltersModal } from "../modals/bestiary_filers_modal";
import { BestiaryFilter } from "src/domain/bestiary_filters";
import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "src/ui/debouncer";
import { mount } from "svelte";
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
    #filteredSmallMonsters: SmallMonster[] = [];
    #debouncer: Debouncer | undefined = undefined;
    #contentContainer: HTMLElement | undefined = undefined;

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
        this.#updateFilters(this.#filters);
        await this.#fillContainer(container);
    }

    async onClose() {
        this.#debouncer?.cancel();
        this.#debouncer = undefined;
    }

    // ---- private methods ----
    async #fillContainer(container: Element) {
        container.empty();
        
        const headerEl = container.createDiv(`side-panel-bestiary-header`);
        this.#contentContainer = container.createDiv('side-panel-bestiary-statblock-container');

        this.#fillHeader(headerEl, this.#contentContainer);

        if (!this.#debouncer) {
            this.#debouncer = new Debouncer(
                DEFAULT_DEBOUNCER_DELAY, 
                async (value: string) =>  {
                    const container = this.#contentContainer;
                    if (!container) return;
                    await this.#renderSmallMonsters(container, value)
                },
            );
        }


        if (sidePanelFullMonster) {
            this.#contentContainer.empty();
            this.#layoutManager.renderLayout(this.#contentContainer, sidePanelFullMonster);
        } else {
            await this.#renderSmallMonsters(this.#contentContainer);
        }
    }

    async #fillHeader(headerContainer: HTMLElement, contentContainer: HTMLElement) {
        const fullFilters = await this.#bestiary.getAllFilters();

        const searchEl = new SearchComponent(headerContainer).setPlaceholder(TEXTS.bestiarySearchPlaceholder);
        searchEl.inputEl.addEventListener("input", async (event) => {
            const value = (event.target as HTMLInputElement).value;
            this.#debouncer?.debounce(value);
        });

        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            contentContainer.empty();
            this.#debouncer?.debounce("");
        });

        const clearButton = new ButtonComponent(headerContainer).setIcon("eraser");
        clearButton.onClick(async (evt) => {
            searchEl.setValue("");
            contentContainer.empty();
            this.#renderSmallMonsters(contentContainer, searchEl.inputEl.value);
        });

        const filtersButton = new ButtonComponent(headerContainer)
            .setIcon("sliders-horizontal")
            .setClass("side-panel-filter-item");
        filtersButton.onClick((evt) => {
            if (!fullFilters) return;
            new BestiaryFiltersModal(
                this.#plugin.app, 
                fullFilters,
                this.#filters, 
                async (filters) => {
                    contentContainer.empty();
                    await this.#updateFilters(filters);
                    this.#renderSmallMonsters(contentContainer, searchEl.inputEl.value);
                },
            ).open();
        });
    }

    async #renderSmallMonsters(container: HTMLElement, searchValue: string = "") {
        const onMonsterClick = async (smallMonster: SmallMonster) => {
            sidePanelFullMonster = await this.#bestiary.getFullMonsterBySmallMonster(smallMonster) ?? undefined;
            this.onOpen();
        }

        const smallMonsters = this.#filteredSmallMonsters.filter(monster => {
            return searchValue.length === 0 || 
                monster.name.rus.toLowerCase().includes(searchValue.toLowerCase()) || 
                monster.name.eng.toLowerCase().includes(searchValue.toLowerCase());
        });
        const groupedMonsters = smallMonsters.reduce((groups, monster) => {
            const { challengeRating } = monster;
            if (!groups[challengeRating]) {
                groups[challengeRating] = [];
            }
            groups[challengeRating].push(monster);
            return groups;
        }, {} as Record<string, typeof smallMonsters>);

        container.empty();
        Object.keys(groupedMonsters)
            .map(key => ({ challengeRating: key, monsters: groupedMonsters[key] }))
            .sort((a, b) => parseCR(a.challengeRating) - parseCR(b.challengeRating))
            .forEach(({ challengeRating, monsters }) => {
                mount(BestiaryGroup, {
                    target: container,
                    props: {
                        challengeRating: challengeRating,
                        smallMonsters: monsters,
                        onMonsterClick: onMonsterClick,
                    },
                });
            });
    }

    async #updateFilters(filters: BestiaryFilter) {
        this.#filters = filters;
        this.#filteredSmallMonsters = await this.#bestiary.getFilteredSmallMonsters(filters);
    }
}

const parseCR = (cr: string) => {
    if (cr === "—") return -1;
    if (cr.includes("/")) {
        const [numerator, denominator] = cr.split("/").map(Number);
        return numerator / denominator;
    }
    return parseFloat(cr);
};

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
