import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";
import type { Type } from "lucide-svelte";

export interface SmallMonster extends BaseItem {
    type: string | Type;
    challengeRating: string;
    source: Source;
}
