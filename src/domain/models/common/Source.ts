export interface Source {
    shortName: string;
    name: string;
    group: {
        name: string;
        shortName: string;
    };
    homebrew?: boolean;
}

export function EmptySource(): Source {
    return {
        shortName: '',
        name: '',
        group: {
            name: '',
            shortName: ''
        }
    };
}