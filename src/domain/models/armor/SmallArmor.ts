import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";
import type { BaseItem } from "../common/BaseItem";

export interface SmallArmor extends BaseItem {
    type: Type;
    armorClass: string;
    price: string;
    source: Source;
}
