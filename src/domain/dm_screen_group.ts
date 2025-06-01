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
}
