import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import type { SmallItem } from "src/domain/models/items/SmallItem";

export class SmallItemSqlTableDao extends Dao<SmallItem, EquipmentFilters> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'small_equipment';
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
                homebrew INTEGER DEFAULT 0
            );
        `);
        console.log(`Table ${this.getTableName()} created`);
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallItems = await this.loadItemsData();
            for (const item of smallItems) {
                await this.createItem(item);
            }
        }
    }

    // CRUD operations
    async createItem(item: SmallItem): Promise<void> {
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
                group_name, group_short_name, homebrew
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
            item.name.rus,
            item.name.eng,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0
        ]);
    }

    async filterByFilters(filters: EquipmentFilters): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (filters.sources.length > 0) {
            whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
            params.push(...filters.sources);
        }

        return WhereClauseData(whereClauses, params);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()}`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: SmallItem): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?, eng_name = ?, source_short_name = ?,
                source_name = ?, group_name = ?, group_short_name = ?,
                homebrew = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            item.url
        ]);
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<SmallItem> {
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
                homebrew: Boolean(values[7]),
            }
        };
    }

    // Private methods
    private async loadItemsData(): Promise<SmallItem[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/equipment.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallWeapons = JSON.parse(data) as SmallItem[];
            console.log(`Loaded ${smallWeapons.length} small items from local storage.`);
            return smallWeapons;
        } catch (error) {
            console.error("Failed to load equipment data:", error);
            return [];
        }
    }
}