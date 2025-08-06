import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";
import type { WithUrl } from "../common/WithUrl";

export interface SmallArmor extends WithUrl {
    name: Name;
    type: Type;
    armorClass: string;
    price: string;
    source: Source;
}
