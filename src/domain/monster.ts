interface Name {
    rus: string;
    eng: string;
}

interface Size {
    rus: string;
    eng: string;
    cell: string;
}

interface Type {
    name: string;
}

interface Source {
    shortName: string;
    name: string;
    group: {
        name: string;
        shortName: string;
    };
}

interface Armor {
    name: string;
    type: string;
    url: string | null;
}

interface Hits {
    average: number;
    formula: string;
    sign: string;
    bonus: number;
}

interface Speed {
    value?: number;
    name?: string;
}

interface Ability {
    str: number;
    dex: number;
    con: number;
    int: number;
    wiz: number;
    cha: number;
}

interface SavingThrow {
    name: string;
    shortName: string;
    value: number;
}

interface Skill {
    name: string;
    value: number;
}

interface Senses {
    passivePerception: string;
    senses: {
        name: string;
        value: number;
    }[];
}

interface Feat {
    name: string;
    value: string;
}

interface Action {
    name: string;
    value: string;
}

interface LegendaryAction {
    name: string;
    value: string;
}

interface Legendary {
    list: LegendaryAction[];
    count: number;
    description: string;
}

interface Tag {
    name: string;
    description: string;
}

export interface SmallMonster {
    name: Name;
    type: Type;
    challengeRating: string;
    url: string;
    source: Source;
}

export interface FullMonster extends SmallMonster {
    size: Size;
    id: number;
    experience: number;
    proficiencyBonus: string;
    alignment: string;
    armorClass: number;
    armors: Armor[];
    hits: Hits;
    speed: Speed[];
    ability: Ability;
    savingThrows: SavingThrow[];
    skills: Skill[];
    damageImmunities: string[];
    conditionImmunities: string[];
    senses: Senses;
    languages: string[];
    feats: Feat[];
    actions: Action[];
    legendary: Legendary;
    tags: Tag[];
    images: string[];
}
