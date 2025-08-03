export interface SpellName {
    rus: string;
    eng: string;
}

export interface SpellComponents {
    v: boolean;
    s: boolean;
    m?: string;
}

export interface SourceGroup {
    name: string;
    shortName: string;
}

export interface Source {
    shortName: string;
    name: string;
    group: SourceGroup;
    homebrew?: boolean;
}

export interface SpellClass {
    name: string;
    url: string;
}

export interface SpellSubclass {
    name: string;
    url: string;
    class: string;
}

export interface FullSpell {
    name: SpellName;
    level: number;
    school: string;
    additionalType?: string;
    components: SpellComponents;
    concentration?: boolean;
    ritual?: boolean;
    url?: string;
    source?: Source;
    id?: number;
    range: string;
    duration: string;
    time: string;
    classes: SpellClass[] | undefined;
    subclasses: SpellSubclass[] | undefined;
    description: string;
    upper?: string,
}

export interface SmallSpell {
    name: SpellName;
    level: number;
    school: string;
    additionalType?: string;
    components: SpellComponents;
    url: string;
    source: Source;
    id?: number;
    concentration?: boolean;
    ritual?: boolean;
    homebrew?: boolean;
}