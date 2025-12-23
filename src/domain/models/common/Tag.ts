export interface Tag {
    name: string;
    description: string;
}

export function EmptyTag(): Tag {
    return {
        name: '',
        description: ''
    } as Tag;
}
