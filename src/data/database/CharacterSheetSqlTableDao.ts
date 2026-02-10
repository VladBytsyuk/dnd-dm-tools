import type { Database, SqlValue } from "sql.js";
import type { App, PluginManifest } from "obsidian";
import { Dao, WhereClauseData } from "../../domain/Dao";
import type {
	SmallCharacterSheet,
	FullCharacterSheet,
	CharacterSheetFilters,
	CharacterSheetParsed,
} from "../../domain/models/character";

/**
 * Single DAO for character sheets that stores full data.
 * Provides methods to retrieve both Small (minimal) and Full (complete) items.
 */
export class CharacterSheetSqlTableDao extends Dao<FullCharacterSheet, CharacterSheetFilters> {
	constructor(database: Database, app: App, manifest: PluginManifest) {
		super(database);
		this.app = app;
		this.manifest = manifest;
	}

	getTableName(): string {
		return "character_sheets";
	}

	getLocalData(): FullCharacterSheet[] {
		// Return empty array - no initial data, users import/create characters
		return [];
	}

	/**
	 * Extracts the primary class name from a character for database storage.
	 * Uses new multiclass format if available, falls back to legacy field.
	 */
	private extractPrimaryClass(item: FullCharacterSheet): string {
		// Try new multiclass format first
		if (item.data?.info?.classes?.value && item.data.info.classes.value.length > 0) {
			return item.data.info.classes.value[0].className || '';
		}
		// Fallback to legacy field or item.charClass
		return item.charClass || item.data?.info?.charClass?.value || '';
	}

	// Table management
	async createTable(): Promise<void> {
		this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_rus TEXT NOT NULL,
                name_eng TEXT NOT NULL,
                char_class TEXT NOT NULL,
                level INTEGER NOT NULL,
                race TEXT NOT NULL,
                player_name TEXT,
                url TEXT UNIQUE NOT NULL,
                is_homebrew INTEGER DEFAULT 1,
                tags TEXT,
                disabled_blocks TEXT,
                edition TEXT,
                spells_config TEXT,
                character_data TEXT,
                json_type TEXT,
                version TEXT
            );
        `);
	}

	// CRUD operations
	async createItem(item: FullCharacterSheet): Promise<void> {
		try {
			const existing = await this.checkItemExists(item);
			if (existing) return;

			const primaryClass = this.extractPrimaryClass(item);

			this.database.exec(
				`
                INSERT INTO ${this.getTableName()} (
                    name_rus,
                    name_eng,
                    char_class,
                    level,
                    race,
                    player_name,
                    url,
                    is_homebrew,
                    tags,
                    disabled_blocks,
                    edition,
                    spells_config,
                    character_data,
                    json_type,
                    version
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
				[
					item.name.rus,
					item.name.eng,
					primaryClass,
					item.level,
					item.race,
					item.playerName || null,
					item.url,
					1, // is_homebrew always 1 for user-created/imported characters
					JSON.stringify(item.tags),
					JSON.stringify(item.disabledBlocks),
					item.edition,
					JSON.stringify(item.spells),
					JSON.stringify(item.data),
					item.jsonType,
					item.version,
				]
			);
		} catch (error) {
			console.error(`Error creating CharacterSheet item ${item.name.rus}:`, error);
			throw error;
		}
	}

	async updateItem(item: FullCharacterSheet): Promise<void> {
		try {
			const primaryClass = this.extractPrimaryClass(item);

			this.database.exec(
				`
                UPDATE ${this.getTableName()} SET
                    name_rus = ?,
                    name_eng = ?,
                    char_class = ?,
                    level = ?,
                    race = ?,
                    player_name = ?,
                    is_homebrew = ?,
                    tags = ?,
                    disabled_blocks = ?,
                    edition = ?,
                    spells_config = ?,
                    character_data = ?,
                    json_type = ?,
                    version = ?
                WHERE url = ?;
            `,
				[
					item.name.rus,
					item.name.eng,
					primaryClass,
					item.level,
					item.race,
					item.playerName || null,
					1, // is_homebrew
					JSON.stringify(item.tags),
					JSON.stringify(item.disabledBlocks),
					item.edition,
					JSON.stringify(item.spells),
					JSON.stringify(item.data),
					item.jsonType,
					item.version,
					item.url,
				]
			);
		} catch (error) {
			console.error(`Error updating CharacterSheet item ${item.name.rus}:`, error);
			throw error;
		}
	}

	async filterByFilters(filters: CharacterSheetFilters): Promise<WhereClauseData> {
		try {
			const whereClauses: string[] = [];
			const params: SqlValue[] = [];

			if (filters.classes.length > 0) {
				whereClauses.push(
					"(" + filters.classes.map(() => `char_class = ?`).join(" OR ") + ")"
				);
				params.push(...filters.classes);
			}
			if (filters.levels.length > 0) {
				whereClauses.push("(" + filters.levels.map(() => `level = ?`).join(" OR ") + ")");
				params.push(...filters.levels);
			}
			if (filters.races.length > 0) {
				whereClauses.push("(" + filters.races.map(() => `race = ?`).join(" OR ") + ")");
				params.push(...filters.races);
			}

			return WhereClauseData(whereClauses, params);
		} catch (error) {
			console.error("Error filtering CharacterSheet by filters:", error);
			throw error;
		}
	}

	/**
	 * Read all items as SmallCharacterSheet (minimal data for lists).
	 * Queries only columns [0-8] for better performance.
	 */
	async readAllSmallItems(
		name: string | null,
		filters: CharacterSheetFilters | null
	): Promise<SmallCharacterSheet[]> {
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

			let query = `SELECT id, name_rus, name_eng, char_class, level, race, player_name, url, is_homebrew FROM ${this.getTableName()}`;
			if (whereClauses && whereClauses.length > 0) {
				query += ` WHERE ${whereClauses.join(" AND ")}`;
			}
			query += ";";
			const result = this.database.exec(query, params);

			if (!result || result.length === 0 || result[0].values.length === 0) return [];

			return result[0].values.map((row) => this.mapToSmallItem(row));
		} catch (error) {
			console.error(`Error reading small items from ${this.getTableName()}:`, error);
			throw error;
		}
	}

	/**
	 * Map minimal SQL columns to SmallCharacterSheet.
	 * SQL index mapping (for small query):
	 * [0] = id, [1] = name_rus, [2] = name_eng, [3] = char_class,
	 * [4] = level, [5] = race, [6] = player_name, [7] = url, [8] = is_homebrew
	 */
	private mapToSmallItem(row: SqlValue[]): SmallCharacterSheet {
		return {
			name: {
				rus: row[1] as string,
				eng: row[2] as string,
			},
			url: row[7] as string,
			charClass: row[3] as string,
			level: row[4] as number,
			race: row[5] as string,
			playerName: (row[6] as string) || undefined,
		};
	}

	/**
	 * Read full item by URL - retrieves all columns.
	 */
	async readFullItemByUrl(url: string): Promise<FullCharacterSheet | null> {
		return this.readItemByUrl(url);
	}

	/**
	 * Map all SQL columns to FullCharacterSheet.
	 * SQL index mapping (full):
	 * [0] = id, [1] = name_rus, [2] = name_eng, [3] = char_class,
	 * [4] = level, [5] = race, [6] = player_name, [7] = url,
	 * [8] = is_homebrew, [9] = tags, [10] = disabled_blocks, [11] = edition,
	 * [12] = spells_config, [13] = character_data, [14] = json_type, [15] = version
	 */
	async mapSqlValues(sqlValues: SqlValue[]): Promise<FullCharacterSheet> {
		try {
			const characterData = JSON.parse(sqlValues[13] as string);
			const parsed: CharacterSheetParsed = {
				tags: JSON.parse(sqlValues[9] as string),
				disabledBlocks: JSON.parse(sqlValues[10] as string),
				edition: sqlValues[11] as string,
				spells: JSON.parse(sqlValues[12] as string),
				data: characterData,
				jsonType: sqlValues[14] as "character",
				version: sqlValues[15] as string,
			};

			return {
				...parsed,
				id: sqlValues[0] as number,
				name: {
					rus: sqlValues[1] as string,
					eng: sqlValues[2] as string,
				},
				url: sqlValues[7] as string,
				charClass: sqlValues[3] as string,
				level: sqlValues[4] as number,
				race: sqlValues[5] as string,
				playerName: (sqlValues[6] as string) || undefined,
			};
		} catch (error) {
			console.error("Error mapping SQL values to FullCharacterSheet:", error);
			throw error;
		}
	}

	/**
	 * Override readAllItems to return Small items by default.
	 * This maintains compatibility with base Dao class while optimizing list queries.
	 */
	async readAllItems(
		name: string | null,
		filters: CharacterSheetFilters | null
	): Promise<FullCharacterSheet[]> {
		// For list views, we actually want full items to work with the base repository
		// The repository will handle the Small/Full distinction
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

			let query = `SELECT * FROM ${this.getTableName()}`;
			if (whereClauses && whereClauses.length > 0) {
				query += ` WHERE ${whereClauses.join(" AND ")}`;
			}
			query += ";";
			const result = this.database.exec(query, params);

			if (!result || result.length === 0 || result[0].values.length === 0) return [];

			return Promise.all(result[0].values.map((it) => this.mapSqlValues(it)));
		} catch (error) {
			console.error(`Error reading items from ${this.getTableName()}:`, error);
			throw error;
		}
	}
}
