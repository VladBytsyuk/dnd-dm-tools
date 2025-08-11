import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { ArtifactFilters } from "src/domain/models/artifact/ArtifactFilters";
import type { SmallArtifact } from "src/domain/models/artifact/SmallArtifact";

export class SmallArtifactSqlTableDao extends Dao<SmallArtifact, ArtifactFilters> {
    
    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
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
        console.log(`Table ${this.getTableName()} created`);
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const smallArtifacts = await this.loadArtifactoryData();
            for (const artifact of smallArtifacts) {
                await this.createItem(artifact);
            }
        }
    }

    // CRUD operations
    async createItem(item: SmallArtifact): Promise<void> {
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

    async filterByFilters(filters: ArtifactFilters): Promise<WhereClauseData> {
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

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);        
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

    // Private methods
    private async loadArtifactoryData(): Promise<SmallArtifact[]> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/artifacts.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const smallWeapons = JSON.parse(data) as SmallArtifact[];
            console.log(`Loaded ${smallWeapons.length} small artifacts from local storage.`);
            return smallWeapons;
        } catch (error) {
            console.error("Failed to load artifactory data:", error);
            return [];
        }
    }
}
