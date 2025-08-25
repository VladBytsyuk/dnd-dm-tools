import type { Database, SqlValue } from 'sql.js';
import type { SmallMonster } from 'src/domain/models/monster/SmallMonster';
import { Dao, WhereClauseData } from '../../domain/Dao';
import type { App, PluginManifest } from 'obsidian';
import type { BestiaryFilters } from 'src/domain/models/monster/BestiaryFilters';

export class SmallMonsterSqlTableDao extends Dao<SmallMonster, BestiaryFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'bestiary.json';
    } 
    
    getTableName(): string {
        return 'small_bestiary';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                type TEXT NOT NULL,
                challenge_rating TEXT NOT NULL,
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
    async createItem(item: SmallMonster): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name, 
                    eng_name, 
                    type, 
                    challenge_rating, 
                    url, 
                    source_short_name, 
                    source_name, 
                    group_name, 
                    group_short_name, 
                    homebrew
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                item.name.rus,
                item.name.eng,
                item.type as string,
                item.challengeRating,
                item.url,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
            ]);
        } catch (error) {
            console.error(`Error creating SmallMonster item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: BestiaryFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.types.length > 0) {
                whereClauses.push('(' + filters.types.map(() => `type = ?`).join(' OR ') + ')');
                params.push(...filters.types);
            }
            if (filters.challangeRatings.length > 0) {
                whereClauses.push('(' + filters.challangeRatings.map(() => `challenge_rating = ?`).join(' OR ') + ')');
                params.push(...filters.challangeRatings);
            }
            if (filters.sources.length > 0) {
                whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
                params.push(...filters.sources);
            }

            return WhereClauseData(whereClauses, params);
        } catch (error) {
            console.error('Error filtering SmallMonster by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallMonster): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    type = ?,
                    challenge_rating = ?,
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
                item.type as string,
                item.challengeRating,
                item.url,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                item.url,
            ]);
        } catch (error) {
            console.error(`Error updating SmallMonster item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallMonster> {
        try {
            return {
                name: {
                    rus: sqlValues[1] as string,
                    eng: sqlValues[2] as string
                },
                type: sqlValues[3] as string,
                challengeRating: sqlValues[4] as string,
                url: sqlValues[5] as string,
                source: {
                    shortName: sqlValues[6] as string,
                    name: sqlValues[7] as string,
                    group: {
                        name: sqlValues[8] as string,
                        shortName: sqlValues[9] as string
                    },
                    homebrew: Boolean(sqlValues[10]),
                },
            };
        } catch (error) {
            console.error('Error mapping SQL values to SmallMonster:', error);
            throw error;
        }
    }
}
