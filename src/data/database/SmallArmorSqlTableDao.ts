import { Dao, WhereClauseData } from "../../domain/Dao";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import type { ArmoryFilters } from "src/domain/models/armor/ArmoryFilters";
import type { SmallArmor } from "src/domain/models/armor/SmallArmor";
import { baseArmory } from "../../assets/data/armory";

export class SmallArmorSqlTableDao extends Dao<SmallArmor, ArmoryFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
    }

    getTableName(): string {
        return 'small_armory';
    }

    getLocalData(): SmallArmor[] {
        return baseArmory;
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
    }

    // CRUD operations
    async createItem(item: SmallArmor): Promise<void> {
        try {
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
        } catch (error) {
            console.error(`Error creating SmallArmor item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: ArmoryFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.types.length > 0) {
                whereClauses.push('(' + filters.types.map(() => `type_name = ?`).join(' OR ') + ')');
                params.push(...filters.types);
            }
            if (filters.sources.length > 0) {
                whereClauses.push('(' + filters.sources.map(() => `source_short_name = ?`).join(' OR ') + ')');
                params.push(...filters.sources);
            }

            return WhereClauseData(whereClauses, params);
        } catch (error) {
            console.error('Error filtering SmallArmor by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallArmor): Promise<void> {
        try {
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
        } catch (error) {
            console.error(`Error updating SmallArmor item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<SmallArmor> {
        try {
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
            }
        } catch (error) {
            console.error('Error mapping SQL values to SmallArmor:', error);
            throw error;
        }
    }
}
