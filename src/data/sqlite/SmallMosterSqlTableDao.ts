import type { Database, SqlValue } from 'sql.js';
import type { SmallMonster } from 'src/domain/monster';
import { SqlTableDao, WhereClauseData } from './SqlTableDao';
import type { App, PluginManifest } from 'obsidian';
import type { BestiaryFilter } from 'src/domain/bestiary_filters';

export class SmallMosterSqlTableDao extends SqlTableDao<SmallMonster, BestiaryFilter> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    } 
    
    getTableName(): string {
        return 'small_bestiary';
    }

    async initialize(): Promise<void> {
        super.initialize();
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallMonsters = await this.loadBestiaryData();
            for (const monster of smallMonsters) {
                await this.createItem(monster);
            }
        }
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
        console.log(`Table ${this.getTableName()} created`);
    }
    
    // CRUD operations
    async createItem(item: SmallMonster): Promise<void> {
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
            item.type,
            item.challengeRating,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.homebrew ? 1 : 0,
        ]);
        console.log(`Put ${item.url} into ${this.getTableName()}`);
    }

    async filterByFilters(filters: BestiaryFilter): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

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
    }

    async updateItem(item: SmallMonster): Promise<void> {
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
            item.type,
            item.challengeRating,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.homebrew ? 1 : 0,
            item.url,
        ]);
    }

    // Mapper
    mapSqlValues(sqlValues: SqlValue[]): SmallMonster {
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
                }
            },
            homebrew: Boolean(sqlValues[10])
        };
    }

    // Private methods
    private async loadBestiaryData(): Promise<SmallMonster[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/bestiary.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallMonsters = JSON.parse(data) as SmallMonster[];
            console.log(`Loaded ${smallMonsters.length} small monsters from local storage.`);
            return smallMonsters;
        } catch (error) {
            console.error("Failed to load bestiary data:", error);
            return [];
        }
    }

}
