import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { WithUrl } from "../common/WithUrl";

export interface SmallItem extends WithUrl {
    name: Name;
    source: Source;
}
