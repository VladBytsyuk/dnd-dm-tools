export interface BestiaryFilter {
    expand: boolean;
    sources: Source[];
    other: OtherFilter[];
}

export interface Source {
    name: string;
    key: string;
    expand: boolean;
    values: SourceValue[];
}

export interface SourceValue {
    label: string;
    key: string;
    tooltip: string;
    default: boolean;
}

export interface OtherFilter {
    name: string;
    key: string;
    expand: boolean;
    type?: string;
    values: OtherValue[];
}

export interface OtherValue {
    label: string;
    key: string | number;
    default: boolean;
}
