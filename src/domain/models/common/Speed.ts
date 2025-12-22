export interface Speed {
    value?: number;
    name?: string;
    additional?: string;
}

export function EmptySpeed(): Speed {
    return {
        value: 0,
        name: '',
        additional: ''
    } as Speed
}