import { Dao } from "../../domain/Dao";
import type { Database, SqlValue } from "sql.js";
import type { FullArmor } from "src/domain/models/armor/FullArmor";

export class FullArmorSqlTableDao extends Dao<FullArmor, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_armory';
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
                armor_class TEXT NOT NULL,
                price TEXT NOT_NULL,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                weight TEXT NOT NULL,
                description TEXT NOT NULL,
                disadvantage INTEGER DEFAULT 0,
                requirement INTEGER DEFAULT 0,
                duration TEXT NOT NULL
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullArmor): Promise<void> {
        const existing = await this.checkItemExists(item);
        if (existing) return;
        this.database.exec(`
            INSERT INTO ${this.getTableName()} (
                rus_name,
                eng_name,
                type_name,
                type_order,
                url,
                armor_class,
                price,
                source_short_name,
                source_name,
                group_name,
                group_short_name,
                homebrew,
                weight,
                description,
                disadvantage,
                requirement,
                duration
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? 0,
            item.url,
            item.armorClass,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            "" + item.weight,
            item.description,
            item.disadvantage ? 1 : 0,
            item.requirement ?? 0,
            item.duration,
        ]);
    }

    async updateItem(item: FullArmor): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?,
                eng_name = ?,
                type_name = ?,
                type_order = ?,
                url = ?,
                armor_class = ?,
                price = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                homebrew = ?,
                weight = ?,
                description = ?,
                disadvantage = ?,
                requirement = ?,
                duration = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? null,
            item.url,
            item.armorClass,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            "" + item.weight,
            item.description,
            item.disadvantage ? 1 : 0,
            item.requirement ?? 0,
            item.duration,
            item.url,
        ]);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<FullArmor> {
        return {
            name: {
                rus: sqlValues[1] as string,
                eng: sqlValues[2] as string
            },
            type: {
                name: sqlValues[3] as string,
                order: sqlValues[4] ? sqlValues[4] as number : undefined,
            },
            url: sqlValues[5] as string,
            armorClass: sqlValues[6] as string,
            price: sqlValues[7] as string,
            source: {
                shortName: sqlValues[8] as string,
                name: sqlValues[9] as string,
                group: {
                    name: sqlValues[10] as string,
                    shortName: sqlValues[11] as string
                },
                homebrew: Boolean(sqlValues[12]),
            },
            weight: +(sqlValues[13] as string),
            description: sqlValues[14] as string,
            disadvantage: Boolean(sqlValues[15]),
            requirement: sqlValues[16] as number,
            duration: sqlValues[17] as string,
        }
    }
}
