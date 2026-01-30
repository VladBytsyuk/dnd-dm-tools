import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";

export interface SmallClass extends BaseItem {
    dice: string;  // Hit dice: "к6", "к8", "к10", "к12"
    source: Source;
    isArchetype: boolean;           // false for base class, true for archetype
    parentClassUrl?: string;        // parent class URL for archetypes
}
