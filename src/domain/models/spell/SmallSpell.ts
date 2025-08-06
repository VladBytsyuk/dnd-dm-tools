import type { Components } from "../common/Components";
import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { WithUrl } from "../common/WithUrl";

export interface SmallSpell extends WithUrl {
    name: Name;
    level: number;
    school: string;
    additionalType?: string;
    components: Components;
    source: Source;
    id?: number;
    concentration?: boolean;
    ritual?: boolean;
}
