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
        const existing = this.database.exec(
            `SELECT 1 FROM ${this.getTableName()} WHERE url = ? LIMIT 1;`,
            [item.url]
        );
        if (existing.length > 0 && existing[0].values.length > 0) {
            console.warn(`Item with url ${item.url} already exists in ${this.getTableName()}. Skipping creation.`);
            return;
        }

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
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: FullItem): Promise<void> {
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
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<FullItem> {
        return {
            name: {
                rus: values[0] as string,
                eng: values[1] as string,
            },
            url: values[2] as string,
            source: {
                shortName: values[3] as string,
                name: values[4] as string,
                group: {
                    name: values[5] as string,
                    shortName: values[6] as string,
                },
                homebrew: !!values[7],
            },
            price: values[8] ? values[8] as string : undefined,
            weight: values[9] ? +(values[9] as string) : undefined,
            description: values[10] as string,
            categories: JSON.parse(values[11] as string),
        };
    }
}