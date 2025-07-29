import { ItemView, Workspace, type WorkspaceLeaf, SearchComponent, ButtonComponent } from "obsidian";
import DndStatblockPlugin from "src/main";
import { TEXTS } from "src/res/texts_ru";
import type { ISpellbook } from "src/data/spellbook";
import { SpellSuggester } from "../suggest/spell_suggester";
import type { SpellLayoutManager } from "../settings/spell_layout_manager";
import type { FullSpell, SmallSpell } from "src/domain/spell";
import { SpellbookFilters } from "src/domain/spellbook_filters";
import { Debouncer, DEFAULT_DEBOUNCER_DELAY } from "src/ui/debouncer";
import SpellGroup from "src/ui/layout/spell/SpellGroup.svelte";
import { mount } from "svelte";
import { SpellbookFiltersModal } from "../modals/spellbook_filers_modal";

export function registerSidePanelSpellbook(
    plugin: DndStatblockPlugin,
    spellbook: ISpellbook,
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
    #spellbook: ISpellbook;
    #layoutManager: SpellLayoutManager;
    #filters: SpellbookFilters = SpellbookFilters([], [], []);
    #filteredSmallSpells: SmallSpell[] = [];
    #debouncer: Debouncer | undefined = undefined;
    #contentContainer: HTMLElement | undefined = undefined;

    constructor(
        leaf: WorkspaceLeaf, 
        plugin: DndStatblockPlugin, 
        spellbook: ISpellbook,
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
        this.#updateFilters(this.#filters);
        this.#fillContainer(container);
    }

    async onClose() {
        this.#debouncer?.cancel();
        this.#debouncer = undefined;
    }

    // ---- private methods ----
    async #fillContainer(container: Element) {
        container.empty();
        
        const headerEl = container.createDiv(`side-panel-spellbook-header`);
        this.#contentContainer = container.createDiv('side-panel-spellbook-statblock-container');
        
        this.#fillHeader(headerEl, this.#contentContainer);

        if (!this.#debouncer) {
            this.#debouncer = new Debouncer(
                DEFAULT_DEBOUNCER_DELAY, 
                async (value: string) => {
                    const container = this.#contentContainer;
                    if (!container) return;
                    this.#renderSmallSpells(container, value);
                }
            );
        }

        if (sidePanelFullSpell) {
            this.#contentContainer.empty();
            this.#layoutManager.renderLayout(this.#contentContainer, sidePanelFullSpell);
        } else {
            await this.#renderSmallSpells(this.#contentContainer);
        }
    }

    async #fillHeader(headerContainer: HTMLElement, contentContainer: HTMLElement) {
        const fullFilters = await this.#spellbook.getAllFilters();
        
        const searchEl = new SearchComponent(headerContainer).setPlaceholder(TEXTS.spellbookSearchPlaceholder);
        searchEl.inputEl.addEventListener('input', async (event) => {
            const value = (event.target as HTMLInputElement).value;
            this.#debouncer?.debounce(value);
        });
        
        searchEl.clearButtonEl.addEventListener('click', () => {
            searchEl.setValue("");
            contentContainer.empty();
            this.#debouncer?.debounce("");
        });

        const clearButton = new ButtonComponent(headerContainer).setIcon("eraser");
        clearButton.onClick((evt) => {
            searchEl.setValue("");
            contentContainer.empty();
            this.#renderSmallSpells(contentContainer, searchEl.inputEl.value);
        });

        const filtersButton = new ButtonComponent(headerContainer)
            .setIcon("sliders-horizontal")
            .setClass("side-panel-filter-item");
        filtersButton.onClick(async (evt) => {
            if (!fullFilters) return;
            new SpellbookFiltersModal(
                this.#plugin.app,
                fullFilters,
                this.#filters,
                async (filters: SpellbookFilters) => {
                    contentContainer.empty();
                    await this.#updateFilters(filters);
                    this.#renderSmallSpells(contentContainer, searchEl.inputEl.value);
                }
            ).open();
        });
    }

    async #renderSmallSpells(container: HTMLElement, searchValue: string = "") {
        const onSpellClick = async (smallSpell: SmallSpell) => {
            sidePanelFullSpell = await this.#spellbook.getFullSpellBySmallSpell(smallSpell) ?? undefined;
            this.onOpen();
        }

        const smallSpells = this.#filteredSmallSpells.filter(spell => {
            return searchValue.length === 0 ||
                spell.name.rus.toLowerCase().includes(searchValue.toLowerCase()) ||
                spell.name.eng.toLowerCase().includes(searchValue.toLowerCase());
        });
        const groupedSpells = smallSpells.reduce((groups, spell) => {
            const { level } = spell;
            if (!groups[level]) {
                groups[level] = [];
            }
            groups[level].push(spell);
            return groups;
        }, {} as Record<string, typeof smallSpells>); 
        
        container.empty();
        Object.keys(groupedSpells)
            .map(key => ({ level: key, spells: groupedSpells[key] }))
            .sort((a, b) => parseInt(a.level) - parseInt(b.level))
            .forEach(({ level, spells }) => {
                mount(SpellGroup, {
                    target: container,
                    props: {
                        level: level,
                        smallSpells: spells,
                        onSpellClick: onSpellClick,
                    },
                })
            });
    }

    async #updateFilters(filters: SpellbookFilters) {
        this.#filters = filters;
        this.#filteredSmallSpells = await this.#spellbook.getFilteredSmallSpells(this.#filters);
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
