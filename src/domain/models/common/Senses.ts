export interface Senses {
    passivePerception: string;
    senses?: {
        name: string;
        value: number;
    }[];
}

export function EmptySenses(): Senses {
    return {
        passivePerception: '',
        senses: []
    } as Senses;
}
