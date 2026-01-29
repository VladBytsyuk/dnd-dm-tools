import type { Database, SqlValue } from 'sql.js';
import type { SmallClass } from 'src/domain/models/class/SmallClass';
import { Dao, WhereClauseData } from '../../domain/Dao';
import type { App, PluginManifest } from 'obsidian';
import type { ClassesFilters } from 'src/domain/models/class/ClassesFilters';
import { baseClasses } from '../../assets/data/classes';

export class SmallClassSqlTableDao extends Dao<SmallClass, ClassesFilters> {

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
        return 'small_classes';
    }

    getLocalData(): SmallClass[] {
        return baseClasses.map(classData => ({
            name: classData.name,
            url: classData.url,
            dice: classData.dice,
            source: classData.source
        }));
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                dice TEXT NOT NULL,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0
            );
        `);
    }

    // CRUD operations
    async createItem(item: SmallClass): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name,
                    eng_name,
                    url,
                    dice,
                    source_short_name,
                    source_name,
                    group_name,
                    group_short_name,
                    homebrew
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                item.name.rus,
                item.name.eng,
                item.url,
                item.dice,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
            ]);
        } catch (error) {
            console.error(`Error creating SmallClass item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: ClassesFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.diceTypes.length > 0) {
                whereClauses.push('(' + filters.diceTypes.map(() => `dice = ?`).join(' OR ') + ')');
                params.push(...filters.diceTypes);
            }
            if (filters.sources.length > 0) {
                whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
                params.push(...filters.sources);
            }

            return WhereClauseData(whereClauses, params);
        } catch (error) {
            console.error('Error filtering SmallClass by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallClass): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    dice = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    homebrew = ?
                WHERE url = ?;
            `, [
                item.name.rus,
                item.name.eng,
                item.dice,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                item.url,
            ]);
        } catch (error) {
            console.error(`Error updating SmallClass item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallClass> {
        try {
            return {
                name: {
                    rus: sqlValues[1] as string,
                    eng: sqlValues[2] as string
                },
                url: sqlValues[3] as string,
                dice: sqlValues[4] as string,
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
            console.error('Error mapping SQL values to SmallClass:', error);
            throw error;
        }
    }
}
