import type { Components } from "../common/Components";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";

export interface SmallSpell {
    name: Name;
    level: number;
    school: string;
    additionalType?: string;
    components: Components;
    url: string;
    source: Source;
    id?: number;
    concentration?: boolean;
    ritual?: boolean;
}
