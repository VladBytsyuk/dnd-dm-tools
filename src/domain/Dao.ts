import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import type { WithUrl } from "./models/common/WithUrl";

export interface WhereClauseData {
    whereClauses: string[];
    params: SqlValue[];
}

export function WhereClauseData(whereClauses: string[], params: SqlValue[]): WhereClauseData {
    return { whereClauses, params };
}

export abstract class Dao<T extends WithUrl, F> {

    app: App | null = null;
    manifest: PluginManifest | null = null;
    preloadFileName: string | null = null;

    constructor(public database: Database) {}

    abstract getTableName(): string;

    async initialize() {
        const tableExists = await this.isTableExists();
        if (!tableExists) {
            await this.createTable();
            console.log(`Table ${this.getTableName()} created`);
        }
    }

    // Table management
    abstract createTable() : Promise<void>;

    async fillTableWithData(): Promise<void> {
        const tableExists = await this.isTableExists();
        if (tableExists) {
            const tableEmpty = await this.isTableEmpty();
            if (tableEmpty && this.preloadFileName) {
                const data = await this.loadDataFromLocalStorage();
                for (const item of data) {
                    await this.createItem(item);
                }
            }
        } else {
            console.warn(`Table ${this.getTableName()} does not exist. Cannot fill with data.`);
        }
    }

    async loadDataFromLocalStorage(): Promise<T[]> {
        const app = this.app;
        const manifest = this.manifest;
        const fileName = this.preloadFileName;
        if (!app || !manifest || !fileName) {
            console.warn("App, manifest or fileName is not defined. Cannot load data from local storage.");
            return [];
        }
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${manifest.dir}/data/${fileName}`;
            const data = await app.vault.adapter.read(filePath);
            const smallItems = JSON.parse(data) as T[];
            console.log(`${this.getTableName()} is preloaded with ${smallItems.length} items from local storage.`);
            return smallItems;
        } catch (error) {
            console.error(`Failed to preload data for ${this.getTableName()}:`, error);
            return [];
        }

    }

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

    async checkItemExists(item: T): Promise<boolean> {
        const existing = this.database.exec(
            `SELECT 1 FROM ${this.getTableName()} WHERE url = ? LIMIT 1;`,
            [item.url]
        );
        if (existing.length > 0 && existing[0].values.length > 0) {
            console.warn(`Item with url ${item.url} already exists in ${this.getTableName()}. Skipping creation.`);
            return false;
        }
        return true;
    }

    async readAllItems(name: string | null, filters: F | null): Promise<T[]> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (name) {
            const filterByNameResult = await this.filterByName(name);
            whereClauses.push(...filterByNameResult.whereClauses);
            params.push(...filterByNameResult.params);
        }

        if (filters) {
            const filterByFiltersResult = await this.filterByFilters(filters);
            whereClauses.push(...filterByFiltersResult.whereClauses);
            params.push(...filterByFiltersResult.params);
        }

        let query = `SELECT * FROM ${this.getTableName()}`
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        query += ';';
        const result = this.database.exec(query, params);

        if (result.length === 0 || result[0].values.length === 0) return [];

        return Promise.all(result[0].values.map(it => this.mapSqlValues(it)));
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async filterByName(name: string): Promise<WhereClauseData> {
        return WhereClauseData(
            [`rus_name LIKE '%' || ? || '%' OR eng_name LIKE '%' || ? || '%'`],
            [name, name]
        );
    }

    async filterByFilters(_: F): Promise<WhereClauseData> {
        return WhereClauseData([], []);
    }

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
    abstract mapSqlValues(values: SqlValue[]): Promise<T>;
}
