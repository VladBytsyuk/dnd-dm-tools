import type { Database, SqlValue } from 'sql.js';
import type { SmallMonster } from 'src/domain/monster';
import type { SqlTableDao } from './SqlTableDao';
import type { App, PluginManifest } from 'obsidian';
import { get } from 'http';
import type { BestiaryFilter } from 'src/domain/bestiary_filters';

export class SmallMosterSqlTableDao implements SqlTableDao<SmallMonster, BestiaryFilter> {

    constructor(
        private database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {} 
    
    getTableName(): string {
        return 'small_bestiary';
    }

    async initialize(): Promise<void> {
        if (!this.database) return;
        const tableExists = await this.isTableExists();
        if (!tableExists) {
            await this.createTable();
        }
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
        if (!this.database) return;
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

    async dropTable(): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DROP TABLE IF EXISTS ${this.getTableName()};
        `);
    }

    async isTableExists(): Promise<boolean> {
        if (!this.database) return false;
        const result = this.database.exec(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='${this.getTableName()}';
        `);
        return result.length > 0 && result[0].values.length > 0;
    }

    async isTableEmpty(): Promise<boolean> {
        if (!this.database) return true;
        const result = this.database.exec(`
            SELECT COUNT(*) FROM ${this.getTableName()};
        `);
        return result.length === 0 || result[0].values[0][0] === 0;
    }

    
    // CRUD operations
    async createItem(item: SmallMonster): Promise<void> {
        if (!this.database) return;
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


    async readAllItems(name: string | null = null, filters: BestiaryFilter | null): Promise<SmallMonster[]> {
        if (!this.database) return [];
        const result = name 
            ? filters 
                ? this.database.exec(`
                    SELECT * FROM ${this.getTableName()}
                    WHERE
                        (
                            rus_name LIKE '%' || ? || '%'
                            OR eng_name LIKE '%' || ? || '%'
                        )
                        AND
                        (${filters.types.length === 0 ? '1' : filters.types.map(() => `type = ?`).join(' OR ')})
                        AND
                        (${filters.challangeRatings.length === 0 ? '1' : filters.challangeRatings.map(() => `challenge_rating = ?`).join(' OR ')})
                        AND
                        (${filters.sources.length === 0 ? '1' : filters.sources.map(() => `source_short_name = ?`).join(' OR ')});
                `, [name, name])
                : this.database.exec(`
                    SELECT * FROM ${this.getTableName()}
                    WHERE
                        (
                            rus_name LIKE '%' || ? || '%'
                            OR eng_name LIKE '%' || ? || '%'
                        );
                `, [name, name])
            : filters 
                ? this.database.exec(`
                    SELECT * FROM ${this.getTableName()}
                    WHERE
                        (${filters.types.length === 0 ? '1' : filters.types.map(type => `type = '${type}'`).join(' OR ')})
                        AND
                        (${filters.challangeRatings.length === 0 ? '1' : filters.challangeRatings.map(cr => `challenge_rating = '${cr}'`).join(' OR ')})
                        AND
                        (${filters.sources.length === 0 ? '1' : filters.sources.map(src => `source_short_name = '${src}'`).join(' OR ')});
                `)
                : this.database.exec(`
                    SELECT * FROM ${this.getTableName()};
                `);
        if (result.length === 0 || result[0].values.length === 0) return [];
        
        return result[0].values.map(it => this.buildSmallMonster(it));
    }

    async readItemByName(name: string): Promise<SmallMonster | null> {
        if (!this.database) return null;
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE rus_name = '${name}' OR eng_name = '${name}';
        `);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const row = result[0].values[0];
        
        return this.buildSmallMonster(row);
    }

    async readItemByUrl(url: string): Promise<SmallMonster | null> {
        if (!this.database) return null;
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE url = '${url}';
        `);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const row = result[0].values[0];
        
        return this.buildSmallMonster(row);
    }


    async updateItem(item: SmallMonster): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = '${item.name.rus}',
                eng_name = '${item.name.eng}',
                type = '${item.type}',
                challenge_rating = '${item.challengeRating}',
                url = '${item.url}',
                source_short_name = '${item.source.shortName}',
                source_name = '${item.source.name}',
                group_name = '${item.source.group.name}',
                group_short_name = '${item.source.group.shortName}',
                homebrew = ${item.homebrew ? 1 : 0}
            WHERE url = '${item.url}';
        `);
    }


    async deleteItemByName(name: string): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DELETE FROM ${this.getTableName()} WHERE rus_name = '${name}' OR eng_name = '${name}';
        `);
    }

    async deleteItemByUrl(url: string): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DELETE FROM ${this.getTableName()} WHERE url = '${url}';
        `);
    }


    // Private methods
    private buildSmallMonster(sqlValues: SqlValue[]): SmallMonster {
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
