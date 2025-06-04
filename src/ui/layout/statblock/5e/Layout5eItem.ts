import type { FullMonster } from 'src/domain/monster';
import { TEXTS } from 'src/res/texts_ru';
import Layout5e from 'src/ui/layout/statblock/5e/Layout5e.svelte';
import { mount, unmount } from 'svelte';
import type { LayoutItemView } from '../../LayoutItemView';
import type { HtmlLinkListener } from 'src/domain/html_click';

export const LAYOUT_5E_ITEM_VIEW_TYPE_EXAMPLE = 'obsidian-dnd-statblock-layout-5e-item-view';

export class Layout5eItemView implements LayoutItemView {

	// ---- fields ----
    #component: ReturnType<typeof Layout5e> | undefined;
    #monster: FullMonster;
    #twoColumns: boolean;
    #htmlLinkListener: HtmlLinkListener;
    #onRoll: (label: string, value: number) => void;

    constructor(
        monster: FullMonster,
        twoColumns: boolean,
        htmlLinkListener: HtmlLinkListener,
        onRoll: (label: string, value: number) => void,
    ) {
        this.#monster = monster;
        this.#twoColumns = twoColumns;
        this.#onRoll = onRoll;
        this.#htmlLinkListener = htmlLinkListener;
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
