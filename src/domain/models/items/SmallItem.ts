import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";

export interface SmallItem extends BaseItem {
    source: Source;
}
