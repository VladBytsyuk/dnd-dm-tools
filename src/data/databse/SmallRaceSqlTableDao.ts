import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { Dao, WhereClauseData } from "src/domain/Dao";
import type { RaceFilters } from "src/domain/models/race/RaceFilters";
import type { SmallRace } from "src/domain/models/race/SmallRace";
import type { AbilityBonus } from "src/domain/models/common/AbilityBonus";
import { baseRaces } from "../../assets/data/races";

interface FlattenedRace {
    race: SmallRace;
    parentUrl: string | null;
}

export class SmallRaceSqlTableDao extends Dao<SmallRace, RaceFilters> {

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
        return 'small_races';
    }

    getLocalData(): SmallRace[] {
        // Flatten the hierarchy for storage
        // The base Dao.fillTableWithData() will call createItem for each
        const flattened = this.flattenRaces(baseRaces, null);
        return flattened.map(f => f.race);
    }

    private flattenRaces(races: SmallRace[], parentUrl: string | null): FlattenedRace[] {
        const result: FlattenedRace[] = [];
        for (const race of races) {
            // Store this race with its parent reference
            result.push({ race, parentUrl });
            // Recursively process subraces
            if (race.subraces && race.subraces.length > 0) {
                result.push(...this.flattenRaces(race.subraces, race.url));
            }
        }
        return result;
    }

    // Cache for parent URLs during data insertion
    private parentUrlCache: Map<string, string | null> = new Map();

    override async fillTableWithData(): Promise<void> {
        const tableExists = await this.isTableExists();
        if (tableExists) {
            const tableEmpty = await this.isTableEmpty();
            if (tableEmpty) {
                // Build parent URL cache before inserting
                const flattened = this.flattenRaces(baseRaces, null);
                for (const item of flattened) {
                    this.parentUrlCache.set(item.race.url, item.parentUrl);
                }
                // Insert all items
                for (const item of flattened) {
                    await this.createItemWithParent(item.race, item.parentUrl);
                }
                if (flattened.length > 0) {
                    console.log(`Table ${this.getTableName()} filled with local data.`);
                }
                // Clear cache after insertion
                this.parentUrlCache.clear();
            }
        } else {
            console.warn(`Table ${this.getTableName()} does not exist. Cannot fill with data.`);
        }
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                abilities TEXT NOT NULL,
                type_name TEXT NOT NULL,
                type_order INTEGER,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                image TEXT,
                race_group_name TEXT,
                race_group_order INTEGER,
                parent_url TEXT
            );
        `);
    }

    // CRUD operations
    async createItem(item: SmallRace): Promise<void> {
        // Use cached parent URL if available, otherwise null
        const parentUrl = this.parentUrlCache.get(item.url) ?? null;
        await this.createItemWithParent(item, parentUrl);
    }

    private async createItemWithParent(item: SmallRace, parentUrl: string | null): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name, eng_name, url, abilities,
                    type_name, type_order,
                    source_short_name, source_name,
                    group_name, group_short_name, homebrew,
                    image, race_group_name, race_group_order,
                    parent_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [
                item.name.rus,
                item.name.eng,
                item.url,
                JSON.stringify(item.abilities),
                item.type.name,
                item.type.order ?? null,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                item.image ?? null,
                item.group?.name ?? null,
                item.group?.order ?? null,
                parentUrl,
            ]);
        } catch (error) {
            console.error(`Error creating SmallRace item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async filterByFilters(filters: RaceFilters): Promise<WhereClauseData> {
        try {
            const whereClauses: string[] = [];
            const params: SqlValue[] = [];

            if (filters.abilities.length > 0) {
                // Filter by ability keys in JSON array
                const abilityConditions = filters.abilities.map(() => `abilities LIKE ?`).join(' OR ');
                whereClauses.push('(' + abilityConditions + ')');
                params.push(...filters.abilities.map(ability => `%"key":"${ability}"%`));
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
        } catch (error) {
            console.error('Error filtering SmallRace by filters:', error);
            throw error;
        }
    }

    async updateItem(item: SmallRace): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?, eng_name = ?, abilities = ?,
                    type_name = ?, type_order = ?,
                    source_short_name = ?, source_name = ?,
                    group_name = ?, group_short_name = ?, homebrew = ?,
                    image = ?, race_group_name = ?, race_group_order = ?
                WHERE url = ?;
            `, [
                item.name.rus,
                item.name.eng,
                JSON.stringify(item.abilities),
                item.type.name,
                item.type.order ?? null,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                item.image ?? null,
                item.group?.name ?? null,
                item.group?.order ?? null,
                item.url,
            ]);
        } catch (error) {
            console.error(`Error updating SmallRace item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Custom method for retrieving races with parent URL for hierarchy reconstruction
    async readAllItemsWithParentUrl(name: string | null, filters: RaceFilters | null): Promise<FlattenedRace[]> {
        try {
            let whereClauses: string[] = [];
            let params: SqlValue[] = [];

            if (name) {
                const filterByNameResult = await this.filterByName(name);
                whereClauses.push(...filterByNameResult.whereClauses);
                params.push(...filterByNameResult.params);
            }

            if (filters) {
                const filterByFiltersResult = await this.filterByFilters(filters);
                whereClauses.push(...filterByFiltersResult.whereClauses);
                params.push(...filterByFiltersResult.params);
            }

            let query = `SELECT * FROM ${this.getTableName()}`
            if (whereClauses && whereClauses.length > 0) {
                query += ` WHERE ${whereClauses.join(' AND ')}`;
            }
            query += ';';
            const result = this.database.exec(query, params);

            if (!result || result.length === 0 || result[0].values.length === 0) return [];

            return Promise.all(result[0].values.map(async row => ({
                race: await this.mapSqlValues(row),
                parentUrl: row[15] as string | null, // parent_url is at index 15
            })));
        } catch (error) {
            console.error(`Error reading items with parent URL from ${this.getTableName()}:`, error);
            throw error;
        }
    }

    // Get only top-level races (no parent)
    async readTopLevelRaces(name: string | null, filters: RaceFilters | null): Promise<SmallRace[]> {
        try {
            let whereClauses: string[] = ['parent_url IS NULL'];
            let params: SqlValue[] = [];

            if (name) {
                const filterByNameResult = await this.filterByName(name);
                whereClauses.push(...filterByNameResult.whereClauses);
                params.push(...filterByNameResult.params);
            }

            if (filters) {
                const filterByFiltersResult = await this.filterByFilters(filters);
                whereClauses.push(...filterByFiltersResult.whereClauses);
                params.push(...filterByFiltersResult.params);
            }

            const query = `SELECT * FROM ${this.getTableName()} WHERE ${whereClauses.join(' AND ')};`;
            const result = this.database.exec(query, params);

            if (!result || result.length === 0 || result[0].values.length === 0) return [];

            return Promise.all(result[0].values.map(it => this.mapSqlValues(it)));
        } catch (error) {
            console.error(`Error reading top-level races from ${this.getTableName()}:`, error);
            throw error;
        }
    }

    // Get subraces for a specific parent
    async readSubracesByParentUrl(parentUrl: string): Promise<SmallRace[]> {
        try {
            const query = `SELECT * FROM ${this.getTableName()} WHERE parent_url = ?;`;
            const result = this.database.exec(query, [parentUrl]);

            if (!result || result.length === 0 || result[0].values.length === 0) return [];

            return Promise.all(result[0].values.map(it => this.mapSqlValues(it)));
        } catch (error) {
            console.error(`Error reading subraces for parent ${parentUrl} from ${this.getTableName()}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<SmallRace> {
        try {
            const abilities: AbilityBonus[] = JSON.parse(values[4] as string);

            const result: SmallRace = {
                name: {
                    rus: values[1] as string,
                    eng: values[2] as string,
                },
                url: values[3] as string,
                abilities,
                type: {
                    name: values[5] as string,
                    order: values[6] ? values[6] as number : undefined,
                },
                source: {
                    shortName: values[7] as string,
                    name: values[8] as string,
                    group: {
                        name: values[9] as string,
                        shortName: values[10] as string,
                    },
                    homebrew: Boolean(values[11]),
                },
            };

            // Add optional fields if present
            if (values[12]) {
                result.image = values[12] as string;
            }
            if (values[13]) {
                result.group = {
                    name: values[13] as string,
                    order: values[14] ? values[14] as number : undefined,
                };
            }

            // Note: subraces are NOT populated here - use readSubracesByParentUrl or repository methods

            return result;
        } catch (error) {
            console.error('Error mapping SQL values to SmallRace:', error);
            throw error;
        }
    }
}
