import type { Components } from "../common/Components";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { BaseItem } from "../common/BaseItem";

export interface SmallSpell extends BaseItem {
    level: number;
    school: string;
    additionalType?: string;
    components: Components;
    source: Source;
    id?: number;
    concentration?: boolean;
    ritual?: boolean;
}
