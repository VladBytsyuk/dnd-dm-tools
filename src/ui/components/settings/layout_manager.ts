import { FullMonster } from "src/domain/monster";
import { DndStatblockPluginSettings } from "./settings";
import { LayoutStyle } from "./layout_style";
import { renderLayout5e } from "src/ui/layout/layout_5e";
import { renderLayoutTtg } from "src/ui/layout/lauot_ttg";

export class LayoutManager {

	// ---- fields ----
    #settings: DndStatblockPluginSettings;

    constructor(settings: DndStatblockPluginSettings) {
        this.#settings = settings;
    }

	// ---- methods ----
    renderLayout(
        container: Element, 
        monster: FullMonster, 
        isTwoColumns: boolean = false,
    ) {
        const layoutStyle = this.#settings.layoutStyle
        switch (layoutStyle) {
            case LayoutStyle.Dnd5e:
                renderLayout5e(container, monster, isTwoColumns)
                break;
            case LayoutStyle.TtgClub:
                renderLayoutTtg(container, monster, isTwoColumns)
                break;
        } 
    }
}
