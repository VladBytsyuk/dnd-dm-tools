import type { SmallWeapon } from "src/domain/models/weapon/SmallWeapon";
import { Dao, WhereClauseData } from "../../domain/Dao";
import type { ArsenalFilters } from "src/domain/models/weapon/ArsenalFilters";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";

export class SmallWeaponSqlTableDao extends Dao<SmallWeapon, ArsenalFilters> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'arsenal.json';
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
                damage_dice TEXT,
                damage_type TEXT NOT NULL,
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
    async createItem(item: SmallWeapon): Promise<void> {
        const existing = await this.checkItemExists(item);
        if (existing) return;
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? 0,
            item.url,
            item.damage.dice ?? null,
            item.damage.type,
            item.price,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
        ]);
    }

    async filterByFilters(filters: ArsenalFilters): Promise<WhereClauseData> {
        let whereClauses: string[] = [];
        let params: SqlValue[] = [];

        if (filters.dices.length > 0) {
            whereClauses.push('(' + filters.dices.map(() => `damage_dice = ?`).join(' OR ') + ')');
            params.push(...filters.dices);
        }
        if (filters.damageTypes.length > 0) {
            whereClauses.push('(' + filters.damageTypes.map(() => `damage_type = ?`).join(' OR ') + ')');
            params.push(...filters.damageTypes);
        }
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
            item.damage.dice ?? null,
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
        }
    }
}
