import type { Database, SqlValue } from "sql.js";

export abstract class SqlTableDao<T, F> {

    constructor(public database: Database) {}

    abstract getTableName(): string;

    async initialize() {
        const tableExists = await this.isTableExists();
        if (!tableExists) {
            await this.createTable();
        }
    }

    // Table management
    abstract createTable() : Promise<void>;

    async dropTable() {
        this.database.exec(`
            DROP TABLE IF EXISTS ${this.getTableName()};
        `);
        console.log(`Table ${this.getTableName()} dropped`);
    }

    async isTableExists(): Promise<boolean> {
        const result = this.database.exec(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='${this.getTableName()}';
        `);
        return result.length > 0 && result[0].values.length > 0;
    }

    async isTableEmpty(): Promise<boolean> {
        const result = this.database.exec(`
            SELECT COUNT(*) FROM ${this.getTableName()};
        `);
        return result.length === 0 || result[0].values[0][0] === 0;
    }

    // CRUD operations
    abstract createItem(item: T): Promise<void>;

    abstract readAllItems(name: string | null, filters: F | null): Promise<T[]>;

    async readItemByName(name: string): Promise<T | null> {
        return this.readItem('rus_name = ? OR eng_name = ?', [name, name]);
    }
    
    async readItemByUrl(url: string): Promise<T | null> {
        return this.readItem('url = ?', [url]);
    }

    async readItem(clause: string, params: SqlValue[]): Promise<T | null> {
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE ${clause};
        `, params);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const row = result[0].values[0];
        
        return this.mapSqlValues(row);
    }

    abstract updateItem(item: T): Promise<void>;

    async deleteItemByName(name: string): Promise<void> {
        this.deleteItem(`rus_name = ? OR eng_name = ?`, [name, name]);
    }

    async deleteItemByUrl(url: string): Promise<void> {
        this.deleteItem(`url = ?`, [url]);
    }

    async deleteItem(clause: string, params: SqlValue[]) {
        this.database.exec(`
            DELETE FROM ${this.getTableName()} WHERE ${clause};
        `, params);
    }

    // Mapper
    abstract mapSqlValues(values: SqlValue[]): T;
}