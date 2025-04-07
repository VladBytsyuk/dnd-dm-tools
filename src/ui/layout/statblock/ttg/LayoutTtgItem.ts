import type { FullMonster } from 'src/domain/monster';
import { TEXTS } from 'src/res/texts_ru';
import LayoutTtg from 'src/ui/layout/statblock/ttg/LayoutTtg.svelte';
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../../LayoutItemView';
import type { App } from 'obsidian';

const LAYOUT_TTG_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-layout-ttg-item-view';

export class LayoutTtgItemView implements LayoutItemView {

	// ---- fields ----
    #app: App;
    #component: ReturnType<typeof LayoutTtg> | undefined;
    #monster: FullMonster;
    #twoColumns: boolean;
    #onRoll: (label: string, value: number) => void;
    #onSpellHover: (url: string) => void;

    constructor(
        app: App,
        monster: FullMonster, 
        twoColumns: boolean,
        onRoll: (label: string, value: number) => void,
        onSpellHover: (url: string) => void,
    ) {
        this.#app = app;
        this.#monster = monster;
        this.#twoColumns = twoColumns;
        this.#onRoll = onRoll;
        this.#onSpellHover = onSpellHover;
    }

	// ---- methods ----
    getViewType() { return LAYOUT_TTG_ITEM_VIEW_TYPE_EXAMPLE; }
    getDisplayText() { return TEXTS.settingsLayout5e; }

    render(container: Element) {
        this.#component = mount(LayoutTtg, {
            target: container,
            props: {
                app: this.#app,
                monster: this.#monster,
                isTwoColumns: this.#twoColumns,
                onRoll: this.#onRoll,
                onSpellHover: this.#onSpellHover,
            },
        });
    }

    destroy() {
        if (this.#component) {
            unmount(this.#component);
            this.#component = undefined;
        }
    }
}
