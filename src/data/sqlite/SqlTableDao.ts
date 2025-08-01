export interface SqlTableDao<T, F> {

    getTableName(): string;
    initialize(): Promise<void>;

    // Table management
    createTable() : Promise<void>;
    dropTable() : Promise<void>;
    isTableExists(): Promise<boolean>;
    isTableEmpty(): Promise<boolean>;

    // CRUD operations
    createItem(item: T): Promise<void>;

    readAllItems(name: string | null, filters: F | null): Promise<T[]>;
    readItemByName(name: String): Promise<T | null>;
    readItemByUrl(url: string): Promise<T | null>;

    updateItem(item: T): Promise<void>;

    deleteItemByName(name: String): Promise<void>;
    deleteItemByUrl(url: string): Promise<void>;
}