import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { BackgroundsFilters } from "src/domain/models/background/BackgroundsFilters";
import type { SmallBackground } from "src/domain/models/background/SmallBackground";
import { baseBackgrounds } from "../../assets/data/backgrounds";

export class SmallBackgroundSqlTableDao extends Dao<SmallBackground, BackgroundsFilters> {
    
    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
    }

    getTableName(): string {
        return 'small_backgrounds';
    }

    getLocalData(): SmallBackground[] {
        return baseBackgrounds;
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
    async createItem(item: SmallBackground): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name, eng_name, url, 
                    source_short_name, source_name, 
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
                item.source.homebrew ? 1 : 0,
            ]);
        } catch (error) {
            console.error(`Error creating SmallBackground item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: BackgroundsFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.sources.length > 0) {
                whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
                params.push(...filters.sources);
            }

            return WhereClauseData(whereClauses, params);
        } catch (error) {
            console.error('Error filtering SmallBackground by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallBackground): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?, eng_name = ?, 
                    source_short_name = ?, source_name = ?,
                    group_name = ?, group_short_name = ?, homebrew = ?
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
        } catch (error) {
            console.error(`Error updating SmallBackground item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<SmallBackground> {
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
                }
            };
        } catch (error) {
            console.error('Error mapping SQL values to SmallBackground:', error);
            throw error;
        }
    }
}