import type { Database, SqlValue } from 'sql.js';
import { Dao, WhereClauseData } from '../../domain/Dao';
import type { App, PluginManifest } from 'obsidian';
import type { SpellbookFilters } from 'src/domain/models/spell/SpellbookFilters';
import type { SmallSpell } from 'src/domain/models/spell/SmallSpell';

export class SmallSpellSqlTableDao extends Dao<SmallSpell, SpellbookFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'spellbook.json';
    } 
    
    getTableName(): string {
        return 'small_spellbook';
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
                components_m INTEGER,
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
    }

    // CRUD operations
    async createItem(item: SmallSpell): Promise<void> {
        const existing = await this.checkItemExists(item);
        if (existing) return;
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            item.name.rus,
            item.name.eng,
            item.level,
            item.school,
            item.additionalType || null,
            item.components.v ? 1 : 0,
            item.components.s ? 1 : 0,
            item.components.m ? 1 : 0,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.source.homebrew ? 1 : 0
        ]);
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
            item.components.m ? 1 : 0,
            item.url,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.source.homebrew ? 1 : 0,
            item.url
        ]);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallSpell> {
        return {
            name: {
                rus: sqlValues[1] as string,
                eng: sqlValues[2] as string,
            },
            level: sqlValues[3] as number,
            school: sqlValues[4] as string,
            additionalType: sqlValues[5] ? (sqlValues[5] as string) : undefined,
            components: {
                v: Boolean(sqlValues[6]),
                s: Boolean(sqlValues[7]),
                m: Boolean(sqlValues[7]) ? (sqlValues[8] as string) : undefined,
            },
            url: sqlValues[9] as string,
            source: {
                shortName: sqlValues[10] as string,
                name: sqlValues[11] as string,
                group: {
                    name: sqlValues[12] as string,
                    shortName: sqlValues[13] as string,
                },
                homebrew: Boolean(sqlValues[16]),
            },
            concentration: sqlValues[14] ? Boolean(sqlValues[14]) : undefined,
            ritual: sqlValues[15] ? Boolean(sqlValues[15]) : undefined,
        };
    }
}
