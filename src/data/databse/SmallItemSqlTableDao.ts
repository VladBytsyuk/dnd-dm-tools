import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { EquipmentFilters } from "src/domain/models/items/EquipmentFilters";
import type { SmallItem } from "src/domain/models/items/SmallItem";

export class SmallItemSqlTableDao extends Dao<SmallItem, EquipmentFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'equipment.json';
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
    }

    // CRUD operations
    async createItem(item: SmallItem): Promise<void> {
        const existing = this.checkItemExists(item);
        if (!existing) return;
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
}
