import type { FullSpell } from "src/domain/spell";
import { LayoutStyle } from "./layout_style";
import type { FullMonster } from "src/domain/monster";

export interface DndStatblockPluginSettings {
	cache: {
        [key: string]: string;
    };
	layoutStyle: LayoutStyle;
	onLayoutStyleChanged: () => void;
}
