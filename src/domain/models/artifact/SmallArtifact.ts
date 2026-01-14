import type { Name } from "../common/Name";
import type { Price } from "../common/Price";
import type { Rarity } from "../common/Rarity";
import type { Source } from "../common/Source";
import type { Type } from "../common/Type";
import type { BaseItem } from "../common/BaseItem";

export interface SmallArtifact extends BaseItem {
    type: Type;
    price: Price;
    source: Source;
    rarity: Rarity;
    customization?: boolean;
    homebrew?: boolean;
}
