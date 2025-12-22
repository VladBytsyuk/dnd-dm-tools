export interface SavingThrow {
    name: string;
    shortName: string;
    value: number;
}

export function EmptySavingThrow() {
    return {
        name: '',
        value: 0,
        shortName: '',
    } as SavingThrow;
}
