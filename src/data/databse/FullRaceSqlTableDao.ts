import type { Database, SqlValue } from "sql.js";
import { Dao } from "src/domain/Dao";
import type { FullRace } from "src/domain/models/race/FullRace";
import type { AbilityBonus } from "src/domain/models/common/AbilityBonus";
import type { Speed } from "src/domain/models/common/Speed";
import type { Tag } from "src/domain/models/common/Tag";

interface FlattenedFullRace {
    race: FullRace;
    parentUrl: string | null;
}

export class FullRaceSqlTableDao extends Dao<FullRace, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_races';
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
                parent_url TEXT,
                description TEXT NOT NULL,
                size TEXT NOT NULL,
                speed TEXT NOT NULL,
                skills TEXT NOT NULL
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullRace): Promise<void> {
        await this.createItemWithParent(item, null);
    }

    async createItemWithParent(item: FullRace, parentUrl: string | null): Promise<void> {
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
                    parent_url,
                    description, size, speed, skills
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
                item.description,
                item.size,
                JSON.stringify(item.speed),
                JSON.stringify(item.skills),
            ]);
        } catch (error) {
            console.error(`Error creating FullRace item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async updateItem(item: FullRace): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?, eng_name = ?, abilities = ?,
                    type_name = ?, type_order = ?,
                    source_short_name = ?, source_name = ?,
                    group_name = ?, group_short_name = ?, homebrew = ?,
                    image = ?, race_group_name = ?, race_group_order = ?,
                    description = ?, size = ?, speed = ?, skills = ?
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
                item.description,
                item.size,
                JSON.stringify(item.speed),
                JSON.stringify(item.skills),
                item.url,
            ]);
        } catch (error) {
            console.error(`Error updating FullRace item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Custom method for retrieving races with parent URL for hierarchy reconstruction
    async readAllItemsWithParentUrl(): Promise<FlattenedFullRace[]> {
        try {
            const query = `SELECT * FROM ${this.getTableName()};`;
            const result = this.database.exec(query);

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

    // Get subraces for a specific parent
    async readSubracesByParentUrl(parentUrl: string): Promise<FullRace[]> {
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
    async mapSqlValues(values: SqlValue[]): Promise<FullRace> {
        try {
            const abilities: AbilityBonus[] = JSON.parse(values[4] as string);
            const speed: Speed[] = JSON.parse(values[18] as string);
            const skills: Tag[] = JSON.parse(values[19] as string);

            const result: FullRace = {
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
                description: values[16] as string,
                size: values[17] as string,
                speed,
                skills,
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
            console.error('Error mapping SQL values to FullRace:', error);
            throw error;
        }
    }
}
