import type { Name } from "../common/Name";
import type { Source } from "../common/Source";
import type { WithUrl } from "../common/WithUrl";

export interface DmScreenItem extends WithUrl {
    name: Name;
    order: number;
    source: Source;
    description?: string;
    group?: string;
    icon?: string;
    parentUrl?: string;
} 

export function DmScreenItem(
    name: Name,
    url: string,
    order: number,
    source: Source,
    group?: string,
    icon?: string,
    description?: string,
    parentUrl?: string,
): DmScreenItem {
    return {
        name: name,
        url: url,
        order: order,
        source: source,
        group: group,
        icon: icon,
        description: description,
        parentUrl: parentUrl
    };
}       
