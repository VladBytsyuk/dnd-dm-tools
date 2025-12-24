export interface Armor {
    name: string;
    type: string;
    url: string | null;
}

export function EmptyArmor(): Armor {
    return {
        name: '',
        type: 'armor',
        url: '/armors/'
    } as Armor;
}