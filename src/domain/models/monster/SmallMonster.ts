import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";

export interface SmallMonster extends BaseItem {
    type: string;
    challengeRating: string;
    source: Source;
}
