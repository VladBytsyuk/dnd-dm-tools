import type { Database, SqlValue } from "sql.js";
import { Dao } from "src/domain/Dao";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";

export class FullArtifactSqlTableDao extends Dao<FullArtifact, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_artifactory';
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
                homebrew INTEGER DEFAULT 0,
                description TEXT NOT NULL,
                detail_type TEXT,
                cost_dmg TEXT,
                cost_xge TEXT,
                images TEXT,
                detail_customization TEXT
            );
        `);
    }

    // CRUD operations
    async createItem(item: FullArtifact): Promise<void> {
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
                type_name,
                type_order,
                url,
                price_dmg,
                price_xge,
                rarity_type,
                rarity_name,
                rarity_short,
                source_short_name,
                source_name,
                group_name,
                group_short_name,
                homebrew,
                description,
                detail_type,
                cost_dmg,
                cost_xge,
                images,
                detail_customization
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            item.description,
            item.detailType ? JSON.stringify(item.detailType) : null,
            item.cost?.dmg ?? null,
            item.cost?.xge ?? null,
            item.images ? JSON.stringify(item.images) : null,
            item.detailCustamization ? JSON.stringify(item.detailCustamization) : null,
        ]);
    }

    async readAllItemsNames(): Promise<string[]> {
        const result = this.database.exec(`SELECT DISTINCT rus_name FROM ${this.getTableName()};`);
        if (result.length === 0 || result[0].values.length === 0) return [];
        return result[0].values.map(it => it[0] as string);
    }

    async updateItem(item: FullArtifact): Promise<void> {
        this.database.exec(`
            UPDATE ${this.getTableName()} SET
                rus_name = ?,
                eng_name = ?,
                type_name = ?,
                type_order = ?,
                url = ?,
                price_dmg = ?,
                price_xge = ?,
                rarity_type = ?,
                rarity_name = ?,
                rarity_short = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                homebrew = ?,
                description = ?,
                detail_type = ?,
                cost_dmg = ?,
                cost_xge = ?,
                images = ?,
                detail_customization = ?
            WHERE url = ?
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
            item.description,
            item.detailType ? JSON.stringify(item.detailType) : null,
            item.cost?.dmg ?? null,
            item.cost?.xge ?? null,
            item.images ? JSON.stringify(item.images) : null,
            item.detailCustamization ? JSON.stringify(item.detailCustamization) : null,
            item.url
        ]);
    }

    // Mapper
    async mapSqlValues(values: SqlValue[]): Promise<FullArtifact> {
        return {
            name: {
                rus: values[1] as string,
                eng: values[2] as string,
            },
            type: {
                name: values[3] as string,
                order: values[4] ? values[4] as number : undefined,
            },
            url: values[5] as string,
            price: {
                dmg: values[6] as string | null,
                xge: values[7] as string | null,
            },
            rarity: {
                type: values[8] as string,
                name: values[9] as string,
                short: values[10] as string,
            },
            source: {
                shortName: values[11] as string,
                name: values[12] as string,
                group: {
                    name: values[13] as string,
                    shortName: values[14] as string,
                },
                homebrew: (values[15] as number) === 1,
            },
            description: values[16] as string,
            detailType: values[17] ? JSON.parse(values[17] as string) : undefined,
            cost: {
                dmg: values[18] as string | null,
                xge: values[19] as string | null,
            },
            images: values[20] ? JSON.parse(values[20] as string) : undefined,
            detailCustamization: values[21] ? JSON.parse(values[21] as string) : undefined,
        };
    }
}
