import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import { SqlTableDao, WhereClauseData } from "./SqlTableDao";
import type { WeaponFilters } from "src/domain/models/weapon/WeaponFilters";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";

export class SmallWeaponSqlTableDao extends SqlTableDao<SmallWeapon, WeaponFilters> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'small_arsenal';
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
                homebrew INTEGER DEFAULT 0
            );
        `);
        console.log(`Table ${this.getTableName()} created`)
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallWeapons = await this.loadArsenalData();
            for (const weapon of smallWeapons) {
                await this.createItem(weapon);
            }
        }
    }

    // CRUD operations
    async createItem(item: SmallWeapon): Promise<void> {
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
                homebrew
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? null,
            item.url,
            item.damage.dice,
            item.damage.type,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
        ]);
    }

    async filterByFilters(filters: WeaponFilters): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (filters.types.length > 0) {
            whereClauses.push('(' + filters.types.map(() => `damage_type = ?`).join(' OR ') + ')');
            params.push(...filters.types);
        }
        if (filters.dices.length > 0) {
            whereClauses.push('(' + filters.dices.map(() => `damage_dice = ?`).join(' OR ') + ')');
            params.push(...filters.dices);
        }

        return WhereClauseData(whereClauses, params);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: SmallWeapon): Promise<void> {
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
                homebrew = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? null,
            item.url,
            item.damage.dice,
            item.damage.type,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            item.url,
        ]);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallWeapon> {
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
                dice: sqlValues[6] as string,
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
        }
    }

    // Private methods
    private async loadArsenalData(): Promise<SmallWeapon[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/arsenal.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallWeapons = JSON.parse(data) as SmallWeapon[];
            console.log(`Loaded ${smallWeapons.length} small weapons from local storage.`);
            return smallWeapons;
        } catch (error) {
            console.error("Failed to load arsenal data:", error);
            return [];
        }
    }
}
