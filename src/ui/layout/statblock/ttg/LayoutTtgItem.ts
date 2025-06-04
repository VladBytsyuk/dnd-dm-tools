import type { FullMonster } from 'src/domain/monster';
import { TEXTS } from 'src/res/texts_ru';
import LayoutTtg from 'src/ui/layout/statblock/ttg/LayoutTtg.svelte';
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../../LayoutItemView';
import type { App } from 'obsidian';
import type { HtmlLinkListener } from 'src/domain/html_click';

const LAYOUT_TTG_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-layout-ttg-item-view';

export class LayoutTtgItemView implements LayoutItemView {

	// ---- fields ----
    #app: App;
    #component: ReturnType<typeof LayoutTtg> | undefined;
    #monster: FullMonster;
    #twoColumns: boolean;
    #htmlLinkListener: HtmlLinkListener;
    #onRoll: (label: string, value: number) => void;

    constructor(
        app: App,
        monster: FullMonster, 
        twoColumns: boolean,
        htmlLinkListener: HtmlLinkListener,
        onRoll: (label: string, value: number) => void,
    ) {
        this.#app = app;
        this.#monster = monster;
        this.#twoColumns = twoColumns;
        this.#htmlLinkListener = htmlLinkListener;
        this.#onRoll = onRoll;
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
                htmlLinkListener: this.#htmlLinkListener,
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
