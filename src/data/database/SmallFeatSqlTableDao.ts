import type { Database, SqlValue } from 'sql.js';
import type { SmallFeat } from 'src/domain/models/feat/SmallFeat';
import { Dao, WhereClauseData } from '../../domain/Dao';
import type { App, PluginManifest } from 'obsidian';
import type { FeatsFilters } from 'src/domain/models/feat/FeatsFilters';

export class SmallFeatSqlTableDao extends Dao<SmallFeat, FeatsFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'feats.json';
    } 
    
    getTableName(): string {
        return 'small_feats';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                requirements TEXT NOT NULL,
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
    async createItem(item: SmallFeat): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name, 
                    eng_name, 
                    requirements, 
                    url, 
                    source_short_name, 
                    source_name, 
                    group_name, 
                    group_short_name, 
                    homebrew
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                item.name.rus,
                item.name.eng,
                item.requirements,
                item.url,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
            ]);
        } catch (error) {
            console.error(`Error creating SmallFeat item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: FeatsFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.sources.length > 0) {
                whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
                params.push(...filters.sources);
            }

            return WhereClauseData(whereClauses, params);
        } catch (error) {
            console.error('Error filtering SmallFeat by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallFeat): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    requirements = ?,
                    url = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    homebrew = ?
                WHERE url = ?;
            `, [
                item.name.rus,
                item.name.eng,
                item.requirements,
                item.url,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                item.url,
            ]);
        } catch (error) {
            console.error(`Error updating SmallFeat item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallFeat> {
        try {
            return {
                name: {
                    rus: sqlValues[1] as string,
                    eng: sqlValues[2] as string
                },
                requirements: sqlValues[3] as string,
                url: sqlValues[4] as string,
                source: {
                    shortName: sqlValues[5] as string,
                    name: sqlValues[6] as string,
                    group: {
                        name: sqlValues[7] as string,
                        shortName: sqlValues[8] as string
                    },
                    homebrew: Boolean(sqlValues[9]),
                },
            };
        } catch (error) {
            console.error('Error mapping SQL values to SmallFeat:', error);
            throw error;
        }
    }
}
