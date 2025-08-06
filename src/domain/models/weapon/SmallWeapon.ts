import type { Damage } from "../common/Damage";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";

export interface SmallWeapon {
    name: Name;
    url: string;
    type: Type;
    damage: Damage;
    price: string;
    source: Source;
}
