import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { WithUrl } from "../common/WithUrl";

export interface SmallMonster extends WithUrl {
    name: Name;
    type: string;
    challengeRating: string;
    source: Source;
}
