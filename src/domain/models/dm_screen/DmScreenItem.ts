import type { Name } from "../common/Name";
import type { Source } from "../common/Source";

export interface DmScreenItem {
    name: Name;
    url: string;
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
        name,
        url,
        order,
        source,
        group,
        icon,
        description,
        parentUrl
    };
}       
