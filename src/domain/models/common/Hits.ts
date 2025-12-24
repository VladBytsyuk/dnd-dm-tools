export interface Hits {
    average: number;
    formula?: string;
    sign?: string;
    bonus?: number;
    text?: string;
}

export function EmptyHits(): Hits {
    return {
        average: 0,
        formula: '',
        sign: '',
        bonus: 0,
        text: ''
    } as Hits;
}
