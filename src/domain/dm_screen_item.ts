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

interface Parent {
    name: Name;
    url: string;
    order: number;
}

export interface DmScreenItem {
    name: Name;
    url: string;
    order: number;
    source: Source;
    description: string;
    parent: Parent;
}
