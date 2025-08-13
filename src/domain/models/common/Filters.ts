export interface Filters {
    [key: string]: string[] | number[];
}

// Универсальный конструктор
export function createFilters<T extends Filters>(defaults: T): T {
    return { ...defaults };
}

// Универсальная функция для пустого фильтра
export function emptyFilters<T extends Filters>(keys: (keyof T)[]): T {
    const obj: any = {};
    keys.forEach(key => {
        obj[key] = [];
    });
    return obj as T;
}

// Универсальная проверка на пустоту
export function isFiltersEmpty<T extends Filters>(filters: T): boolean {
    return Object.values(filters).every(arr => Array.isArray(arr) && arr.length === 0);
}