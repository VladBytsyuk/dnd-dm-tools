import type { Damage } from "../common/Damage";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";
import type { BaseItem } from "../common/BaseItem";

export interface SmallWeapon extends BaseItem {
    type: Type;
    damage: Damage;
    price: string;
    source: Source;
}
