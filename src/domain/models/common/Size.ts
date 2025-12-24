export interface Size {
    rus: string;
    eng: string;
    cell: string;
}

export function EmptySize(): Size {
    return {
        rus: '',
        eng: '',
        cell: ''
    } as Size;
}
