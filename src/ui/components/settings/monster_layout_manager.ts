import type { FullMonster } from "src/domain/monster";
import type { DndStatblockPluginSettings } from "./settings";
import { LayoutStyle } from "./layout_style";
import { Layout5eItemView } from "src/ui/layout/statblock/5e/Layout5eItem";
import { LayoutTtgItemView } from "src/ui/layout/statblock/ttg/LayoutTtgItem";
import type { LayoutItemView } from "src/ui/layout/LayoutItemView";
import { App, Notice } from "obsidian";
import type { FullSpell } from "src/domain/spell";
import type { Spellbook } from "src/data/spellbook";
import { SpellTooltipItemView } from "src/ui/layout/spell/SpellTooltipItem";

class LayoutManagerCache {

    #itemView: LayoutItemView;
    #container: Element;
    #monster: FullMonster;
    #isTwoColumns: boolean;

    constructor(itemView: LayoutItemView, container: Element, monster: FullMonster, isTwoColumns: boolean) {
        this.#itemView = itemView;
        this.#container = container;
        this.#monster = monster;
        this.#isTwoColumns = isTwoColumns;
    }

    getItemView(): LayoutItemView { return this.#itemView; };
    getContainer(): Element { return this.#container; };
    getMonster(): FullMonster { return this.#monster; };
    getIsTwoColumns(): boolean { return this.#isTwoColumns; };
}

export class MonsterLayoutManager {


	// ---- fields ----
    #app: App;
    #settings: DndStatblockPluginSettings;
    #spellbook: Spellbook;
    #cache: LayoutManagerCache[] = [];
    #spells: Map<string, Element> = new Map();
    

    constructor(app: App, settings: DndStatblockPluginSettings, spellbook: Spellbook) {
        this.#app = app;
        this.#settings = settings;
        this.#spellbook = spellbook;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        monster: FullMonster, 
        isTwoColumns: boolean = false,
    ) {
        const onRoll = (label: string, value: number): void => {
            new Notice(`${label ? label + ": " : ""}${value}`);
        };
        const onSpellRelease = (url: string) => {
            const element = this.#spells.get(url);
            element?.parentElement?.removeChild(element);
            this.#spells.delete(url);
        };
        const onSpellHover = async (url: string, x: number, y: number) => {
            onSpellRelease(url);
            const fullSpell = await this.#spellbook.getFullSpellByUrl(url);
            if (!fullSpell) return;
            const tooltipItem = new SpellTooltipItemView(fullSpell, x, y, onRoll);
            const parent = container.parentElement;
            if (parent) {
                const div = parent.createDiv("spell-card-tooltip")
                this.#spells.set(url, div);
                tooltipItem.render(div);
            }
        };
        this.#cache
            .find((item) => item.getContainer() == container)
            ?.getItemView()
            ?.destroy();
        container.empty();
        const layoutStyle = this.#settings.layoutStyle;
        const viewContainer = container.createDiv("statblock-view-container");
        let itemView: LayoutItemView;
        switch (layoutStyle) {
            case LayoutStyle.Dnd5e:
                itemView = new Layout5eItemView(monster, isTwoColumns, onRoll);
                break;
            case LayoutStyle.TtgClub:
                itemView = new LayoutTtgItemView(this.#app, monster, isTwoColumns, onRoll, onSpellHover, onSpellRelease);
                break;
            default:
                throw new Error(`Unknown layout style: ${layoutStyle}`);
        } 
        itemView.render(viewContainer);
        const cacheItem = new LayoutManagerCache(itemView, container, monster, isTwoColumns);
        this.#cache.push(cacheItem);
    }

    onChangeLayoutStyle() {
        this.#cache
            .filter((item) => item.getContainer().isActiveElement)
            .forEach((item) => this.renderLayout(item.getContainer(), item.getMonster(), item.getIsTwoColumns()));
    }

    dispose() {
        this.#cache = [];
    }
}
