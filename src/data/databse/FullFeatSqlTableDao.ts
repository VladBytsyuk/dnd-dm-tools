import type { Database, SqlValue } from 'sql.js';
import { Dao } from "../../domain/Dao";
import type { FullFeat } from 'src/domain/models/feat/FullFeat';

export class FullFeatSqlTableDao extends Dao<FullFeat, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_feats';
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
                homebrew INTEGER DEFAULT 0,
                description TEXT NOT NULL
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullFeat): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(
                `INSERT INTO ${this.getTableName()} (
                    rus_name, 
                    eng_name, 
                    requirements, 
                    url, 
                    source_short_name, 
                    source_name, 
                    group_name, 
                    group_short_name, 
                    homebrew,
                    description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    item.description,
                ]
            );
        } catch (error) {
            console.error(`Error creating FullFeat item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async updateItem(item: FullFeat): Promise<void> {
        try {
            this.database.exec(
                `UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    requirements = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    homebrew = ?,
                    description = ?
                WHERE url = ?;`,
                [
                    item.name.rus,
                    item.name.eng,
                    item.requirements,
                    item.source.shortName,
                    item.source.name,
                    item.source.group.name,
                    item.source.group.shortName,
                    item.source.homebrew ? 1 : 0,
                    item.description,
                    item.url,
                ]
            );
        } catch (error) {
            console.error(`Error updating FullFeat item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<FullFeat> {
        try {
            return {
                name: {
                    rus: sqlValues[1] as string,
                    eng: sqlValues[2] as string,
                },
                requirements: sqlValues[3] as string,
                url: sqlValues[4] as string,
                source: {
                    shortName: sqlValues[5] as string,
                    name: sqlValues[6] as string,
                    group: {
                        name: sqlValues[7] as string,
                        shortName: sqlValues[8] as string,
                    },
                    homebrew: Boolean(sqlValues[9]),
                },
                description: sqlValues[10] as string,
            };
        } catch (error) {
            console.error('Error mapping SQL values for FullFeat:', error);
            throw error;
        }
    }
}
