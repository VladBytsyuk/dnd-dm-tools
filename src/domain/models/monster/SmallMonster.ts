import type { Name } from "../common/Name";
import type { Source } from "../../spell";

export interface SmallMonster {
    name: Name;
    type: string;
    challengeRating: string;
    url: string;
    source: Source;
    homebrew?: boolean;
}
