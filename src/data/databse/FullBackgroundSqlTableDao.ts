import type { Database, SqlValue } from "sql.js";
import { Dao } from "src/domain/Dao";
import type { FullBackground } from "src/domain/models/background/FullBackground";

export class FullBackgroundSqlTableDao extends Dao<FullBackground, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_backgrounds';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                associated_url TEXT NOT NULL,
                associated_html TEXT,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                skills TEXT NOT NULL,
                tool_ownership TEXT NOT NULL,
                equipments TEXT NOT NULL,
                start_gold INTEGER NOT NULL,
                description TEXT NOT NULL,
                personalization TEXT
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullBackground): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(`
                INSERT INTO ${this.getTableName()} (
                    rus_name,
                    eng_name,
                    url,
                    associated_url,
                    associated_html,
                    source_short_name,
                    source_name,
                    group_name,
                    group_short_name,
                    homebrew,
                    skills,
                    tool_ownership,
                    equipments,
                    start_gold,
                    description,
                    personalization
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.name.rus,
                item.name.eng,
                item.url,
                item.associatedUrl ?? '',
                item.associatedHtml ?? '',
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                JSON.stringify(item.skills),
                item.toolOwnership,
                JSON.stringify(item.equipments),
                item.startGold,
                item.description,
                item.personalization ?? null,
            ]);
        } catch (error) {
            console.error(`Error creating FullBackground item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async updateItem(item: FullBackground): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    associated_url = ?,
                    associated_html = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    homebrew = ?,
                    skills = ?,
                    tool_ownership = ?,
                    equipments = ?,
                    start_gold = ?,
                    description = ?,
                    personalization = ?
                WHERE url = ?
            `, [
                item.name.rus,
                item.name.eng,
                item.associatedUrl ?? '',
                item.associatedHtml ?? '',
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.source.homebrew ? 1 : 0,
                JSON.stringify(item.skills),
                item.toolOwnership,
                JSON.stringify(item.equipments),
                item.startGold,
                item.description,
                item.personalization ?? null,
                item.url
            ]);
        } catch (error) {
            console.error(`Error updating FullBackground item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<FullBackground> {
        try {
            return {
                name: {
                    rus: values[1] as string,
                    eng: values[2] as string,
                },
                url: values[3] as string,
                associatedUrl: values[4] as string,
                associatedHtml: values[5] as string,
                source: {
                    shortName: values[6] as string,
                    name: values[7] as string,
                    group: {
                        name: values[8] as string,
                        shortName: values[9] as string,
                    },
                    homebrew: (values[10] as number) === 1,
                },
                skills: JSON.parse(values[11] as string) as string[],
                toolOwnership: values[12] as string,
                equipments: JSON.parse(values[13] as string) as string[],
                startGold: values[14] as number,
                description: values[15] as string,
                personalization: values[16] as string | null || undefined,
            };
        } catch (error) {
            console.error('Error mapping SQL values to FullBackground:', error);
            throw error;
        }
    }
}