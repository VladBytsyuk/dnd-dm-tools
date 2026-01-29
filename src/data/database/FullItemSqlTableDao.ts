import type { Database, SqlValue } from "sql.js";
import { Dao } from "src/domain/Dao";
import type { FullItem } from "src/domain/models/items/FullItem";

export class FullItemSqlTableDao extends Dao<FullItem, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_equipment';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                price TEXT,
                weight TEXT,
                description TEXT NOT NULL,
                categories TEXT
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullItem): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name, eng_name, url, source_short_name, source_name,
                    group_name, group_short_name, homebrew, price, weight, description, categories
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
                item.name.rus, item.name.eng, item.url, item.source.shortName,
                item.source.name, item.source.group.name, item.source.group.shortName,
                item.source.homebrew ? 1 : 0, item.price ?? null, item.weight ? "" + item.weight : null,
                item.description, JSON.stringify(item.categories),
            ]);
        } catch (error) {
            console.error(`Error creating FullItem item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async updateItem(item: FullItem): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    homebrew = ?,
                    price = ?,
                    weight = ?,
                    description = ?,
                    categories = ?
                WHERE url = ?;
            `, [
                item.name.rus, item.name.eng, item.source.shortName, item.source.name,
                item.source.group.name, item.source.group.shortName, item.source.homebrew ? 1 : 0,
                item.price ?? null, item.weight ? "" + item.weight : null, item.description, 
                JSON.stringify(item.categories), item.url
            ]);
        } catch (error) {
            console.error(`Error updating FullItem item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<FullItem> {
        try {
            return {
                name: {
                    rus: values[1] as string,
                    eng: values[2] as string,
                },
                url: values[3] as string,
                source: {
                    shortName: values[4] as string,
                    name: values[5] as string,
                    group: {
                        name: values[6] as string,
                        shortName: values[7] as string,
                    },
                    homebrew: Boolean(values[8]),
                },
                price: values[9] ? values[9] as string : undefined,
                weight: values[10] ? +(values[10] as string) : undefined,
                description: values[11] as string,
                categories: JSON.parse(values[12] as string),
            };
        } catch (error) {
            console.error('Error mapping SQL values to FullItem:', error);
            throw error;
        }
    }
}