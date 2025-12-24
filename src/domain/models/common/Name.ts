export interface Name {
    rus: string;
    eng: string;
}

export function EmptyName(): Name {
    return {
        rus: '',
        eng: ''
    } as Name;
}