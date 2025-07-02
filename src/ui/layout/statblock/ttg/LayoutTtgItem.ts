import type { FullMonster } from 'src/domain/monster';
import { TEXTS } from 'src/res/texts_ru';
import LayoutTtg from 'src/ui/layout/statblock/ttg/LayoutTtg.svelte';
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../../LayoutItemView';
import type { App } from 'obsidian';
import type { UiEventListener } from 'src/data/ui_event_listener';

const LAYOUT_TTG_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-layout-ttg-item-view';

export class LayoutTtgItemView implements LayoutItemView {

	// ---- fields ----
    #app: App;
    #component: ReturnType<typeof LayoutTtg> | undefined;
    #monster: FullMonster;
    #twoColumns: boolean;
    #uiEventListener: UiEventListener;

    constructor(
        app: App,
        monster: FullMonster, 
        twoColumns: boolean,
        uiEventListener: UiEventListener,
    ) {
        this.#app = app;
        this.#monster = monster;
        this.#twoColumns = twoColumns;
        this.#uiEventListener = uiEventListener;
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
                uiEventListener: this.#uiEventListener,
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
