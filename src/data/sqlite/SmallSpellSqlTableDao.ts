import type { Database, SqlValue } from 'sql.js';
import { SqlTableDao, WhereClauseData } from './SqlTableDao';
import type { App, PluginManifest } from 'obsidian';
import type { SmallSpell } from 'src/domain/spell';
import type { SpellbookFilters } from 'src/domain/spellbook_filters';

export class SmallSpellSqlTableDao extends SqlTableDao<SmallSpell, SpellbookFilters> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    } 
    
    getTableName(): string {
        return 'small_spellbook';
    }

    async initialize(): Promise<void> {
        super.initialize();
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallSpells = await this.loadSpellbookData();
            for (const spell of smallSpells) {
                await this.createItem(spell);
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
                level INTEGER NOT_NULL,
                school TEXT NOT NULL,
                additional_type TEXT,
                components_v INTEGER NOT NULL,
                components_s INTEGER NOT NULL,
                components_m TEXT DEFAULT 0,
                url TEXT NOT NULL UNIQUE,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                concentration INTEGER DEFAULT 0,
                ritual INTEGER DEFAULT 0,
                homebrew INTEGER DEFAULT 0
            );
        `);
        console.log(`Table ${this.getTableName()} created`);
    }
    
    // CRUD operations
    async createItem(item: SmallSpell): Promise<void> {
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
                level,
                school,
                additional_type,
                components_v,
                components_s,   
                components_m,
                url,
                source_short_name,
                source_name,
                group_name,
                group_short_name,
                concentration,
                ritual,
                homebrew
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            item.name.rus,
            item.name.eng,
            item.level,
            item.school,
            item.additionalType || null,
            item.components.v ? 1 : 0,
            item.components.s ? 1 : 0,
            item.components.m || null,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.homebrew ? 1 : 0
        ]);
        console.log(`Put ${item.url} into ${this.getTableName()}`);
    }

    async filterByFilters(filters: SpellbookFilters): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (filters.levels.length > 0) {
            whereClauses.push('(' + filters.levels.map(() => `level = ?`).join(' OR ') + ')');
            params.push(...filters.levels);
        }
        if (filters.schools.length > 0) {
            whereClauses.push('(' + filters.schools.map(() => `school = ?`).join(' OR ') + ')');
            params.push(...filters.schools);
        }
        if (filters.sources.length > 0) {
            whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
            params.push(...filters.sources);
        }

        return WhereClauseData(whereClauses, params);
    }

    async updateItem(item: SmallSpell): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?,
                eng_name = ?,
                level = ?,
                school = ?,
                additional_type = ?,
                components_v = ?,
                components_s = ?,
                components_m = ?,
                url = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                concentration = ?,
                ritual = ?,
                homebrew = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.level,
            item.school,
            item.additionalType || null,
            item.components.v ? 1 : 0,
            item.components.s ? 1 : 0,
            item.components.m || null,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.homebrew ? 1 : 0,
            item.url
        ]);
    }

    // Mapper
    mapSqlValues(sqlValues: SqlValue[]): SmallSpell {
        return {
            name: {
                rus: sqlValues[0] as string,
                eng: sqlValues[1] as string,
            },
            level: sqlValues[2] as number,
            school: sqlValues[3] as string,
            additionalType: sqlValues[4] ? (sqlValues[4] as string) : undefined,
            components: {
                v: Boolean(sqlValues[5]),
                s: Boolean(sqlValues[6]),
                m: sqlValues[7] ? (sqlValues[7] as string) : undefined,
            },
            url: sqlValues[8] as string,
            source: {
                shortName: sqlValues[9] as string,
                name: sqlValues[10] as string,
                group: {
                    name: sqlValues[11] as string,
                    shortName: sqlValues[12] as string,
                },
            },
            concentration: sqlValues[14] ? Boolean(sqlValues[14]) : undefined,
            ritual: sqlValues[15] ? Boolean(sqlValues[15]) : undefined,
            homebrew: Boolean(sqlValues[10])
        };
    }

    // Private methods
    private async loadSpellbookData(): Promise<SmallSpell[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/spellbook.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallMonsters = JSON.parse(data) as SmallSpell[];
            console.log(`Loaded ${smallMonsters.length} small spells from local storage.`);
            return smallMonsters;
        } catch (error) {
            console.error("Failed to load spellbook data:", error);
            return [];
        }
    }
}
