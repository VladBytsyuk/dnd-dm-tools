import { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import { Dao } from "../../domain/Dao";
import type { App, PluginManifest } from "obsidian";
import type { Database, SqlValue } from "sql.js";

export class DmScreenGroupSqlTableDao extends Dao<DmScreenItem, any> {

    constructor(
        database: Database,
        app: App,
        manifest: PluginManifest,
    ) {
        super(database);
        this.app = app;
        this.manifest = manifest;
        this.preloadFileName = 'dm_screen.json';
    }
    

    getTableName(): string {
        return 'dm_screen_items';
    }

    // Table management
    async createTable(): Promise<void> {
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                order_item INTEGER DEFAULT 0,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                group_item TEXT,
                icon TEXT,
                description TEXT,
                parent_url TEXT
            );
        `);
    }

    async fillTableWithData(): Promise<void> {
        const tableEmpty = await this.isTableEmpty();
        if (tableEmpty) {
            const groups = await this.loadDmScreenGroups();
            for (const group of groups || []) {
                await this.createItem(group);
            }
        }
    }

    // CRUD operations
    async createItem(item: DmScreenItem): Promise<void> {
        try {
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
                    rus_name, 
                    eng_name,
                    url,
                    order_item,
                    source_short_name,
                    source_name,
                    group_name,
                    group_short_name,
                    group_item,
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
                item.parentUrl || null,
            ]);
        } catch (error) {
            console.error(`Error creating DmScreenItem ${item.name.rus}:`, error);
            throw error;
        }
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT name_rus FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: DmScreenItem): Promise<void> {
        try {
            this.database.exec(`
                UPDATE ${this.getTableName()} SET
                    rus_name = ?,
                    eng_name = ?,
                    order_item = ?,
                    source_short_name = ?,
                    source_name = ?,
                    group_name = ?,
                    group_short_name = ?,
                    group_item = ?,
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
                item.description || null,
                item.url
            ]);
        } catch (error) {
            console.error(`Error updating DmScreenItem ${item.name.rus}:`, error);
            throw error;
        }
    }

    async mapSqlValues(values: SqlValue[]): Promise<DmScreenItem> {
        try {
            return DmScreenItem(
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
                values[12] as string | undefined,
            );
        } catch (error) {
            console.error('Error mapping SQL values for DmScreenItem:', error);
            throw error;
        }
    }

    async readChildrenCount(url: string): Promise<number> {
        try {
            const result = this.database.exec(`
                SELECT COUNT(*) FROM ${this.getTableName()} WHERE parent_url = ?;
            `, [url]);
            return result.length;
        } catch (error) {
            console.error(`Error reading children count for ${url}:`, error);
            throw error;
        }
    }

    async readChildren(url: string | undefined = undefined): Promise<DmScreenItem[]> {
        try {
            let result = [];
            if (url) {
                result = this.database.exec(`
                    SELECT * FROM ${this.getTableName()} WHERE parent_url = ?;
                `, [url]);
            } else {
                result = this.database.exec(`
                    SELECT * FROM ${this.getTableName()} WHERE parent_url IS NULL;
                `);
            }
            if (result.length === 0 || result[0].values.length === 0) return [];
            return await Promise.all(result[0].values.map(it => this.mapSqlValues(it)));
        } catch (error) {
            console.error(`Error reading children for ${url}:`, error);
            throw error;
        }
    }

    // Private methods
    private async loadDmScreenGroups(): Promise<DmScreenItem[]> {
        const app = this.app;
        const manifest = this.manifest;
        const fileName = this.preloadFileName;
        if (!app || !manifest || !fileName) {
            console.warn("App, manifest or fileName is not defined. Cannot load data from local storage.");
            return [];
        }
        try {
            // Путь к файлу относительно корневой директории плагина
            const filePath = `${manifest.dir}/data/${this.preloadFileName}`;
            const data = await app.vault.adapter.read(filePath);
            const groups = JSON.parse(data) as DmScreenGroup[];
            const result = [];
            for (const group of groups) {
                result.push(this.mapGroupToItem(group))
                result.push(...this.allChildrenOfGroup(group, group.url))
            }
            console.log(`${this.getTableName()} is preloaded with ${result.length} items from local storage.`);
            return result;
        } catch (error) {
            console.error(`Failed to preload data for ${this.getTableName()}:`, error);
            return [];  
        }
    }

    private allChildrenOfGroup(group: DmScreenGroup, parentUrl: string): DmScreenItem[] {
        const result = [];
        for (const child of group.children || []) {
            result.push(this.mapGroupToItem(child, parentUrl));
            result.push(...this.allChildrenOfGroup(child, child.url))
        }
        return result;
    }

    private mapGroupToItem(group: DmScreenGroup, parentUrl: string | undefined = undefined): DmScreenItem {
        return DmScreenItem(
            group.name,
            group.url,
            group.order,
            group.source,
            group.group,
            group.icon,
            group.description,
            parentUrl,
        )
    }
}

interface DmScreenGroup {
    name: Name;
    url: string;
    order: number;
    source: Source;
    group?: string;
    icon?: string;
    description?: string;
    children?: DmScreenGroup[];
} 

interface SourceGroup {
    name: string;
    shortName: string;
}

interface Source {
    shortName: string;
    name: string;
    group: SourceGroup;
}

interface Name {
    rus: string;
    eng: string;
}
