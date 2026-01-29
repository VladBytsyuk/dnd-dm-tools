import type { Database, SqlValue } from 'sql.js';
import { Dao } from "../../domain/Dao";
import type { FullClass } from 'src/domain/models/class/FullClass';
import { baseClasses } from '../../assets/data/classes';

export class FullClassSqlTableDao extends Dao<FullClass, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_classes';
    }

    getLocalData(): FullClass[] {
        // Return empty array - HTML content fetched on-demand
        return [];
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                dice TEXT NOT NULL,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                is_archetype INTEGER DEFAULT 0,
                parent_class_url TEXT,
                archetype_type_name TEXT,
                archetype_type_order INTEGER,
                associated_url TEXT,
                associated_html TEXT,
                FOREIGN KEY (parent_class_url) REFERENCES full_classes(url)
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullClass): Promise<void> {
        try {
            const existing = await this.checkItemExists(item);
            if (existing) return;
            this.database.exec(
                `INSERT INTO ${this.getTableName()} (
                    rus_name, eng_name, url, dice,
                    source_short_name, source_name, group_name, group_short_name, homebrew,
                    is_archetype, parent_class_url, archetype_type_name, archetype_type_order,
                    associated_url, associated_html
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
                [
                    item.name.rus,
                    item.name.eng,
                    item.url,
                    item.dice,
                    item.source.shortName,
                    item.source.name,
                    item.source.group.name,
                    item.source.group.shortName,
                    item.source.homebrew ? 1 : 0,
                    item.isArchetype ? 1 : 0,
                    item.parentClassUrl || null,
                    item.archetypeType?.name || null,
                    item.archetypeType?.order ?? null,
                    item.associatedUrl || null,
                    item.associatedHtml || null,
                ]
            );
        } catch (error) {
            console.error(`Error creating FullClass item ${item.name.rus}:`, error);
            throw error;
        }
    }

    async updateItem(item: FullClass): Promise<void> {
        try {
            this.database.exec(
                `UPDATE ${this.getTableName()} SET
                    rus_name = ?, eng_name = ?, dice = ?,
                    source_short_name = ?, source_name = ?, group_name = ?, group_short_name = ?, homebrew = ?,
                    is_archetype = ?, parent_class_url = ?, archetype_type_name = ?, archetype_type_order = ?,
                    associated_url = ?, associated_html = ?
                WHERE url = ?;`,
                [
                    item.name.rus,
                    item.name.eng,
                    item.dice,
                    item.source.shortName,
                    item.source.name,
                    item.source.group.name,
                    item.source.group.shortName,
                    item.source.homebrew ? 1 : 0,
                    item.isArchetype ? 1 : 0,
                    item.parentClassUrl || null,
                    item.archetypeType?.name || null,
                    item.archetypeType?.order ?? null,
                    item.associatedUrl || null,
                    item.associatedHtml || null,
                    item.url,
                ]
            );
        } catch (error) {
            console.error(`Error updating FullClass item ${item.name.rus}:`, error);
            throw error;
        }
    }

    // Mapper
    async mapSqlValues(sqlValues: SqlValue[]): Promise<FullClass> {
        try {
            return {
                id: sqlValues[0] as number,
                name: {
                    rus: sqlValues[1] as string,
                    eng: sqlValues[2] as string
                },
                url: sqlValues[3] as string,
                dice: sqlValues[4] as string,
                source: {
                    shortName: sqlValues[5] as string,
                    name: sqlValues[6] as string,
                    group: {
                        name: sqlValues[7] as string,
                        shortName: sqlValues[8] as string,
                    },
                    homebrew: sqlValues[9] ? Boolean(sqlValues[9]) : undefined,
                },
                isArchetype: Boolean(sqlValues[10]),
                parentClassUrl: sqlValues[11] as string || undefined,
                archetypeType: sqlValues[12] && sqlValues[13] ? {
                    name: sqlValues[12] as string,
                    order: sqlValues[13] as number,
                } : undefined,
                associatedUrl: sqlValues[14] as string || undefined,
                associatedHtml: sqlValues[15] as string || undefined,
            };
        } catch (error) {
            console.error('Error mapping SQL values to FullClass:', error);
            throw error;
        }
    }
}
