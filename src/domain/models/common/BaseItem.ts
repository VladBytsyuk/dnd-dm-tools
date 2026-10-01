import type { Name } from "./Name";
import type { EntityOrigin } from "./EntityOrigin";

export interface BaseItem {
    name: Name;
    url: string;
    /** Runtime metadata; absent values are legacy remote entities. */
    origin?: EntityOrigin;
}
