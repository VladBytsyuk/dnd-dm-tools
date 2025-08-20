import type { Database, SqlValue } from "sql.js";
import { Dao } from "src/domain/Dao";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { DetailType } from "../../domain/models/common/DetailType";

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
                customization INTEGER DEFAULT 0,
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
        const existing = await this.checkItemExists(item);
        if (existing) return;
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
                cusstomization,
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            item.customization ? 1 : 0,
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
            item.detailCustomization ? JSON.stringify(item.detailCustomization) : null,
        ]);
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
                customization = ?,
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
            item.customization ? 1 : 0,
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
            item.detailCustomization ? JSON.stringify(item.detailCustomization) : null,
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
            customization: Boolean(values[11]),
            source: {
                shortName: values[12] as string,
                name: values[13] as string,
                group: {
                    name: values[14] as string,
                    shortName: values[15] as string,
                },
                homebrew: (values[16] as number) === 1,
            },
            description: values[17] as string,
            detailType: values[18] ? JSON.parse(values[18] as string) as DetailType[] : undefined,
            cost: {
                dmg: values[19] as string | null,
                xge: values[20] as string | null,
            },
            images: values[21] ? JSON.parse(values[21] as string) : undefined,
            detailCustomization: values[22] ? JSON.parse(values[22] as string) : undefined,
        };
    }
}
