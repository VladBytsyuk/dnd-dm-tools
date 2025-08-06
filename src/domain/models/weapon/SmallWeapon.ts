import type { Damage } from "../common/Damage";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";
import type { WithUrl } from "../common/WithUrl";

export interface SmallWeapon extends WithUrl {
    name: Name;
    type: Type;
    damage: Damage;
    price: string;
    source: Source;
}
