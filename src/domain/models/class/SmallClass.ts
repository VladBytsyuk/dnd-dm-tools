import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";

export interface SmallClass extends BaseItem {
    dice: string;  // Hit dice: "к6", "к8", "к10", "к12"
    source: Source;
}
