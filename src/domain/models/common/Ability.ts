export interface Ability {
    str: number;
    dex: number;
    con: number;
    int: number;
    wiz: number;
    cha: number;
}

export function EmptyAbility(): Ability {
    return {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wiz: 10,
        cha: 10,
    };
}
