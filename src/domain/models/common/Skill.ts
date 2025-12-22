export interface NamedValue {
    name: string;
    value: number | string;
}

export function EmptySkill(): NamedValue {
    return {
        name: '',
        value: 0
    } as NamedValue;
}