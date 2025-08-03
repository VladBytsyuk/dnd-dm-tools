import type { Database, SqlValue } from 'sql.js';
import { SqlTableDao } from "./SqlTableDao";
import type { FullSpell } from 'src/domain/spell';

export class FullSpellSqlTableDao extends SqlTableDao<FullSpell, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_spellbook';
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
                homebrew INTEGER DEFAULT 0,
                range TEXT NOT NULL,
                duration TEXT NOT NULL,
                time TEXT NOT NULL,
                classes TEXT,
                subclasses TEXT,
                description TEXT NOT NULL,
                upper TEXT
            );
        `);
        console.log(`Table ${this.getTableName()} created`);
    }

    // CRUD operations
    async createItem(item: FullSpell): Promise<void> {
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
                rus_name, eng_name, level, school, additional_type,
                components_v, components_s, components_m, url,
                source_short_name, source_name, group_name, group_short_name,
                concentration, ritual, homebrew, range, duration, time,
                classes, subclasses, description, upper
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
            item.source?.shortName || null,
            item.source?.name || null,
            item.source?.group.name || null,
            item.source?.group.shortName || null,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.homebrew ? 1 : 0,
            item.range,
            item.duration,
            item.time,
            JSON.stringify(item.classes ?? []),
            JSON.stringify(item.subclasses ?? []),
            item.description,
            item.upper ?? null,
        ]);
        console.log(`Put ${item.url} into ${this.getTableName()}`);
    }

    async updateItem(item: FullSpell): Promise<void> {
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
                homebrew = ?,
                range = ?,
                duration = ?,
                time = ?,
                classes = ?,
                subclasses = ?,
                description = ?,
                upper = ?
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
            item.source?.shortName || null,
            item.source?.name || null,
            item.source?.group.name || null,
            item.source?.group.shortName || null,
            item.concentration ? 1 : 0,
            item.ritual ? 1 : 0,
            item.homebrew ? 1 : 0,
            item.range,
            item.duration,
            item.time,
            JSON.stringify(item.classes ?? []),
            JSON.stringify(item.subclasses ?? []),
            item.description,
            item.upper ?? null,
            item.url,
        ]);
        console.log(`Updated ${item.url} in ${this.getTableName()}`);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<FullSpell> {
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
            concentration: Boolean(sqlValues[13]),
            ritual: Boolean(sqlValues[14]),
            homebrew: Boolean(sqlValues[15]),
            range: sqlValues[16] as string,
            duration: sqlValues[17] as string,
            time: sqlValues[18] as string,
            classes: JSON.parse(sqlValues[19] as string) || [],
            subclasses: JSON.parse(sqlValues[20] as string) || [],
            description: sqlValues[21] as string,
            upper: sqlValues[22] ? (sqlValues[22] as string) : undefined,
        };
    }
}
