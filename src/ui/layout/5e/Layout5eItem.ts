import type { FullMonster } from 'src/domain/monster';
import { TEXTS } from 'src/res/texts_ru';
import Layout5e from 'src/ui/layout/5e/Layout5e.svelte';
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../LayoutItemView';

export const LAYOUT_5E_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-layout-5e-item-view';

export class Layout5eItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof Layout5e> | undefined;
    #monster: FullMonster;
    #twoColumns: boolean;

    constructor(
        monster: FullMonster,
        twoColumns: boolean,
    ) {
        this.#monster = monster;
        this.#twoColumns = twoColumns;
    }

	// ---- methods ----
    getViewType() { return LAYOUT_5E_ITEM_VIEW_TYPE_EXAMPLE; }
    getDisplayText() { return TEXTS.settingsLayout5e; }

    render(container: Element) {
        this.#component = mount(Layout5e, {
            target: container,
            props: {
                monster: this.#monster,
                isTwoColumns: this.#twoColumns,
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
