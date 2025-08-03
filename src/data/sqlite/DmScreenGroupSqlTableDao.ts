import { DmScreenGroup, EmptyDmScreenGroup } from "src/domain/dm_screen_group";
import { SqlTableDao } from "./SqlTableDao";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";
import { TEXTS } from "src/res/texts_ru";

export class DmScreenGroupSqlTableDao extends SqlTableDao<DmScreenGroup, any> {

    constructor(
        database: Database,
        private app: App,
        private manifest: PluginManifest,
    ) {
        super(database);
    }
    

    getTableName(): string {
        return 'dm_screen_groups';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_rus TEXT NOT NULL,
                name_eng TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                order INTEGER DEFAULT 0,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                group TEXT,
                icon TEXT,
                description TEXT,
                parent_url TEXT,
            );
        `);
        console.log(`Table ${this.getTableName()} created`);
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const mainGroup = await this.loadDmScreenGroups();
            for (const group of mainGroup.children || []) {
                await this.createItem(group, mainGroup.url);
            }
            await this.createItem(mainGroup);
        }
    }

    // CRUD operations
    async createItem(item: DmScreenGroup, parentUrl: string| null = null): Promise<void> {
        const existing = this.database.exec(
            `SELECT 1 FROM ${this.getTableName()} WHERE url = ? LIMIT 1;`,
            [item.url]
        );
        if (existing.length > 0 && existing[0].values.length > 0) {
            console.warn(`Item with url ${item.url} already exists in ${this.getTableName()}. Skipping creation.`);
            return;
        }
        for (const child of item.children || []) {
            await this.createItem(child, item.url);
        }
        this.database.exec(`
            INSERT INTO ${this.getTableName()} (
                name_rus, 
                name_eng,
                url,
                order,
                source_short_name,
                source_name,
                group_name,
                group_short_name,
                group,
                icon,
                description,
                parent_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [
            item.name.rus,
            item.name.eng,
            item.url,
            item.order,
            item.source.shortName,
            item.source.name,
            item.source.group.name || null,
            item.source.group.shortName || null,
            item.group || null,
            item.icon || null,
            item.description || null,
            parentUrl || null,
        ]);
        console.log(`Put ${item.url} in ${this.getTableName()}`);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT name_rus FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: DmScreenGroup): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                name_rus = ?,
                name_eng = ?,
                order = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                group = ?,
                icon = ?,
                description = ?
            WHERE url = ?;
        `, [
            item.name.rus,
            item.name.eng,
            item.order,
            item.source.shortName,
            item.source.name,
            item.source.group.name || null,
            item.source.group.shortName || null,
            item.group || null,
            item.icon || null,
            item.description || null,
            item.url
        ]);
        console.log(`Updated ${item.url} in ${this.getTableName()}`);
    }

    async mapSqlValues(values: SqlValue[]): Promise<DmScreenGroup> {
        const children = await this.readChildren(values[3] as string);
        return DmScreenGroup(
            { rus: values[1] as string, eng: values[2] as string },
            values[3] as string,
            values[4] as number,
            {
                shortName: values[5] as string,
                name: values[6] as string,
                group: {
                    name: values[7] as string,
                    shortName: values[8] as string
                }
            },
            values[9] as string | undefined,
            values[10] as string | undefined,
            values[11] as string | undefined,
            children
        );
    }

    // Private methods
    private async readChildren(url: string): Promise<DmScreenGroup[]> {
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE parent_url = ?;
        `, [url]);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return await Promise.all(result[0].values.map(it => this.mapSqlValues(it)));
    }

    private async loadDmScreenGroups(): Promise<DmScreenGroup> {
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${this.manifest.dir}/data/dm_screen.json`;
            const data = await this.app.vault.adapter.read(filePath);
            const groups = JSON.parse(data) as DmScreenGroup[];
            console.log(`Loaded ${groups.length} DM Screen groups from local storage.`);
            return DmScreenGroup(
                { rus: TEXTS.dmScreenTitle, eng: '' },
                '',
                0,
                {      
                    shortName: '',
                    name: '',
                    group: { name: '', shortName: '' }
                },          
                undefined,
                undefined,
                undefined,        
                groups
            );
        } catch (error) {
            console.error("Failed to load  DM Screen groups:", error);
            return EmptyDmScreenGroup();  
        }
    }
}
