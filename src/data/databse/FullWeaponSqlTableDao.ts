import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import { Dao } from "../../domain/Dao";
import type { Database, SqlValue } from "sql.js";

export class FullWeaponSqlTableDao extends Dao<FullWeapon, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_arsenal';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                type_name TEXT NOT NULL,
                type_order INTEGER,
                url TEXT NOT NULL UNIQUE,
                damage_dice TEXT NOT NULL,
                damage_type TEXT NOT NULL,
                price TEXT NOT_NULL,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                weight TEXT NOT NULL,
                special TEXT,
                properties TEXT
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullWeapon): Promise<void> {
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
                type_name,
                type_order,
                url,
                damage_dice,
                damage_type,
                price,
                source_short_name,
                source_name,
                group_name,
                group_short_name,
                homebrew,
                weight,
                special,
                properties
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? null,
            item.url,
            item.damage.dice ?? null,
            item.damage.type,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            "" + item.weight,
            item.special ?? null,
            JSON.stringify(item.properties ?? []),
        ]);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: FullWeapon): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?,
                eng_name = ?,
                type_name = ?,
                type_order = ?,
                url = ?,
                damage_dice = ?,
                damage_type = ?,
                price = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                homebrew = ?,
                weight = ?,
                special = ?,
                properties = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? null,
            item.url,
            item.damage.dice ?? null,
            item.damage.type,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            "" + item.weight,
            item.special ?? null,
            JSON.stringify(item.properties ?? []),
            item.url,
        ]);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<FullWeapon> {
        return {
            name: {
                rus: sqlValues[1] as string,
                eng: sqlValues[2] as string
            },
            type: {
                name: sqlValues[3] as string,
                order: sqlValues[4] as number,
            },
            url: sqlValues[5] as string,
            damage: {
                dice: sqlValues[6] ? sqlValues[6] as string : undefined,
                type: sqlValues[7] as string,
            },
            price: sqlValues[8] as string,
            source: {
                shortName: sqlValues[9] as string,
                name: sqlValues[10] as string,
                group: {
                    name: sqlValues[11] as string,
                    shortName: sqlValues[12] as string
                },
                homebrew: Boolean(sqlValues[13]),
            },
            weight: +(sqlValues[14] as string),
            special: sqlValues[15] ? sqlValues[15] as string : undefined,
            properties: JSON.parse(sqlValues[16] as string) || [],
        }
    }
}
