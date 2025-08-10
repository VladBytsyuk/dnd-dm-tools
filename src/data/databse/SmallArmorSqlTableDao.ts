import { Dao, WhereClauseData } from "../../domain/Dao";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import type { ArmorFilters } from "src/domain/models/armor/ArmorFilters";
import type { SmallArmor } from "src/domain/models/armor/SmallArmor";

export class SmallArmorSqlTableDao extends Dao<SmallArmor, ArmorFilters> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'small_armory';
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
                homebrew INTEGER DEFAULT 0
            );
        `);
        console.log(`Table ${this.getTableName()} created`)
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallArmors = await this.loadArmoryData();
            for (const armors of smallArmors) {
                await this.createItem(armors);
            }
        }
    }

    // CRUD operations
    async createItem(item: SmallArmor): Promise<void> {
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
                armor_class,
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
            item.type.order ?? 0,
            item.url,
            item.armorClass,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
        ]);
    }

    async filterByFilters(filters: ArmorFilters): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (filters.types.length > 0) {
            whereClauses.push('(' + filters.types.map(() => `type_name = ?`).join(' OR ') + ')');
            params.push(...filters.types);
        }
        if (filters.sources.length > 0) {
            whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
            params.push(...filters.sources);
        }

        return WhereClauseData(whereClauses, params);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: SmallArmor): Promise<void> {
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
                homebrew = ?
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
            item.url,
        ]);
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallArmor> {
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
        }
    }

    // Private methods
    private async loadArmoryData(): Promise<SmallArmor[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/armory.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallWeapons = JSON.parse(data) as SmallArmor[];
            console.log(`Loaded ${smallWeapons.length} small armors from local storage.`);
            return smallWeapons;
        } catch (error) {
            console.error("Failed to load armory data:", error);
            return [];
        }
    }
}
