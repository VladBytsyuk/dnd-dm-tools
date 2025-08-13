import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { ArtifactoryFilters } from "src/domain/models/artifact/ArtifactoryFilters";
import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";

export class SmallArtifactSqlTableDao extends Dao<SmallArtifact, ArtifactoryFilters> {
    
    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'artifacts.json';
    }

    getTableName(): string {
        return 'small_artifactory';
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
                price_dmg TEXT,
                price_xge TEXT,
                rarity_type TEXT NOT NULL,
                rarity_name TEXT NOT NULL,
                rarity_short TEXT NOT NULL,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0
            );
        `);
    }

    // CRUD operations
    async createItem(item: SmallArtifact): Promise<void> {
        const existing = this.checkItemExists(item);
        if (!existing) return;
        this.database.exec(`
            INSERT INTO ${this.getTableName()} (
                rus_name, eng_name, type_name, type_order, url, 
                price_dmg, price_xge, rarity_type, rarity_name, 
                rarity_short, source_short_name, source_name, 
                group_name, group_short_name, homebrew
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? 0,
            item.url,
            item.price.dmg ?? null,
            item.price.xge ?? null,
            item.rarity.type,
            item.rarity.name,
            item.rarity.short,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
        ]);
    }

    async filterByFilters(filters: ArtifactoryFilters): Promise<WhereClauseData> {
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
        if (filters.rarities.length > 0) {
            whereClauses.push('(' + filters.rarities.map(() => `rarity_short = ?`).join(' OR ') + ')');
            params.push(...filters.rarities);
        }

        return WhereClauseData(whereClauses, params);
    }

    async updateItem(item: SmallArtifact): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?, eng_name = ?, type_name = ?, type_order = ?,
                price_dmg = ?, price_xge = ?, rarity_type = ?, rarity_name = ?,
                rarity_short = ?, source_short_name = ?, source_name = ?,
                group_name = ?, group_short_name = ?, homebrew = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.type.name,
            item.type.order ?? 0,
            item.price.dmg ?? null,
            item.price.xge ?? null,
            item.rarity.type,
            item.rarity.name,
            item.rarity.short,
            item.source.shortName,
            item.source.name,
            item.source.group.name,
            item.source.group.shortName,
            item.source.homebrew ? 1 : 0,
            item.url
        ]);
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<SmallArtifact> {
        return {
            name: {
                rus: values[0] as string,
                eng: values[1] as string,
            },
            type: {
                name: values[2] as string,
                order: values[3] ? values[3] as number : undefined,
            },
            url: values[4] as string,
            price: {
                dmg: values[5] as string | null,
                xge: values[6] as string | null,
            },
            rarity: {
                type: values[7] as string,
                name: values[8] as string,
                short: values[9] as string,
            },
            source: {
                shortName: values[10] as string,
                name: values[11] as string,
                group: {
                    name: values[12] as string,
                    shortName: values[13] as string,
                },
                homebrew: Boolean(values[14]),
            }
        };
    }
}
