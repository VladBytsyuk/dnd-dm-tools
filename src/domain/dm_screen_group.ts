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

export function EmptyDmScreenItem() : DmScreenItem {
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
        parentUrl: undefined,
    };
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
