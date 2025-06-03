interface SourceGroup {
    name: string;
    shortName: string;
}

interface Source {
    shortName: string;
    name: string;
    group: SourceGroup;
}

interface Name {
    rus: string;
    eng: string;
}

export interface DmScreenGroup {
    name: Name;
    url: string;
    order: number;
    source: Source;
    group?: string;
    icon?: string;
    description?: string;
    children?: DmScreenGroup[];
} 

export function EmptyDmScreenGroup() : DmScreenGroup {
    return {
        name: { rus: '', eng: '' },
        url: '',
        order: 0,
        source: {
            shortName: '',
            name: '',
            group: { name: '', shortName: '' }
        },
        group: undefined,
        icon: undefined,
        description: undefined,
        children: []
    };
}

export function DmScreenGroup(
    name: Name,
    url: string,
    order: number,
    source: Source,
    group?: string,
    icon?: string,
    description?: string,
    children?: DmScreenGroup[]
): DmScreenGroup {
    return {
        name,
        url,
        order,
        source,
        group,
        icon,
        description,
        children
    };
}       

export function groupedChildrenOf(group: DmScreenGroup): Array<{ subgroupName: string, group: DmScreenGroup[] }> {
    const map = new Map<string, DmScreenGroup[]>();
    if (group.children) {
        for (const child of group.children) {
            if (!map.has(child.group || '')) {
                map.set(child.group || '', []);
            }
            map.get(child.group || '')!.push(child);
        }
    }
    const result: Array<{ subgroupName: string, group: DmScreenGroup[] }> = [];         
    for (const [subgroupName, group] of map.entries()) {
        result.push({ subgroupName, group });
    }
    return result;
}
