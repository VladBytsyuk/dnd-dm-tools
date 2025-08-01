import type { Database, SqlValue } from 'sql.js';
import type { FullMonster } from "src/domain/monster";
import type { SqlTableDao } from "./SqlTableDao";

export class FullMonsterSqlTableDao implements SqlTableDao<FullMonster, any> {

    constructor(
        private database: Database,
    ) {}

    getTableName(): string {
        return 'full_bestiary';
    }

    async initialize(): Promise<void> {
        if (!this.database) return;
        const tableExists = await this.isTableExists();
        if (!tableExists) {
            await this.createTable();
        }
    }


    // Table management
    async createTable(): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            CREATE TABLE ${this.getTableName()} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rus_name TEXT NOT NULL,
                eng_name TEXT NOT NULL,
                type TEXT NOT NULL,
                challenge_rating TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                source_short_name TEXT NOT NULL,
                source_name TEXT NOT NULL,
                group_name TEXT NOT NULL,
                group_short_name TEXT NOT NULL,
                homebrew INTEGER DEFAULT 0,
                size_rus TEXT,
                size_eng TEXT,
                size_cell TEXT,
                experience INTEGER,
                proficiency_bonus TEXT,
                alignment TEXT,
                armor_class INTEGER,
                armors TEXT,
                hits_average INTEGER,
                hits_formula TEXT,
                hits_sign TEXT,
                hits_bonus INTEGER,
                speed TEXT,
                ability_str INTEGER,
                ability_dex INTEGER,
                ability_con INTEGER,
                ability_int INTEGER,
                ability_wiz INTEGER,
                ability_cha INTEGER,
                saving_throws TEXT,
                skills TEXT,
                damage_vulnerabilities TEXT,
                damage_resistances TEXT,
                damage_immunities TEXT,
                condition_immunities TEXT,
                senses TEXT,
                languages TEXT,
                feats TEXT,
                actions TEXT,
                bonus_actions TEXT,
                reactions TEXT,
                legendary TEXT,
                mythic TEXT,
                lair TEXT,
                tags TEXT,
                images TEXT
            );
        `);
        console.log(`Table ${this.getTableName()} created`);
    }

    async dropTable(): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DROP TABLE IF EXISTS ${this.getTableName()};
        `);
        console.log(`Table ${this.getTableName()} dropped`);
    }

    async isTableExists(): Promise<boolean> {
        if (!this.database) return false;
        const result = this.database.exec(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='${this.getTableName()}';
        `);
        return result.length > 0 && result[0].values.length > 0;
    }

    async isTableEmpty(): Promise<boolean> {
        if (!this.database) return true;
        const result = this.database.exec(`
            SELECT COUNT(*) as count FROM ${this.getTableName()};
        `);
        return result.length > 0 && result[0].values[0][0] === 0;
    }


    // CRUD operations
    async createItem(item: FullMonster): Promise<void> {
        if (!this.database) return;
        this.database.run(
            `INSERT INTO ${this.getTableName()} (
                rus_name, eng_name, type, challenge_rating, url, source_short_name, source_name, group_name, group_short_name, homebrew,
                size_rus, size_eng, size_cell, experience, proficiency_bonus, alignment, armor_class, armors,
                hits_average, hits_formula, hits_sign, hits_bonus, speed,
                ability_str, ability_dex, ability_con, ability_int, ability_wiz, ability_cha,
                saving_throws, skills, damage_vulnerabilities, damage_resistances, damage_immunities, condition_immunities,
                senses, languages, feats, actions, bonus_actions, reactions, legendary, mythic, lair, tags, images
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                item.name.rus,
                item.name.eng,
                item.type,
                item.challengeRating,
                item.url,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.homebrew ? 1 : 0,
                item.size?.rus ?? null,
                item.size?.eng ?? null,
                item.size?.cell ?? null,
                item.experience ?? null,
                item.proficiencyBonus ?? null,
                item.alignment ?? null,
                item.armorClass ?? null,
                JSON.stringify(item.armors ?? []),
                item.hits?.average ?? null,
                item.hits?.formula ?? null,
                item.hits?.sign ?? null,
                item.hits?.bonus ?? null,
                JSON.stringify(item.speed ?? []),
                item.ability?.str ?? null,
                item.ability?.dex ?? null,
                item.ability?.con ?? null,
                item.ability?.int ?? null,
                item.ability?.wiz ?? null,
                item.ability?.cha ?? null,
                JSON.stringify(item.savingThrows ?? []),
                JSON.stringify(item.skills ?? []),
                JSON.stringify(item.damageVulnerabilities ?? []),
                JSON.stringify(item.damageResistances ?? []),
                JSON.stringify(item.damageImmunities ?? []),
                JSON.stringify(item.conditionImmunities ?? []),
                JSON.stringify(item.senses ?? {}),
                JSON.stringify(item.languages ?? []),
                JSON.stringify(item.feats ?? []),
                JSON.stringify(item.actions ?? []),
                JSON.stringify(item.bonusActions ?? []),
                JSON.stringify(item.reactions ?? []),
                JSON.stringify(item.legendary ?? {}),
                JSON.stringify(item.mythic ?? {}),
                JSON.stringify(item.lair ?? {}),
                JSON.stringify(item.tags ?? []),
                JSON.stringify(item.images ?? [])
            ]
        );
        console.log(`Put ${item.url} into ${this.getTableName()}`);
    }


    async readAllItems(name: string | null = null): Promise<FullMonster[]> {
        if (!this.database) return [];
        let whereClauses: string[] = [];
        let params: any[] = [];

        if (name) {
            whereClauses.push(`(rus_name LIKE '%' || ? || '%' OR eng_name LIKE '%' || ? || '%')`);
            params.push(name, name);
        }

        let query = `SELECT * FROM ${this.getTableName()}`;
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        query += ';';
        const result = this.database.exec(query, params);

        if (result.length === 0 || result[0].values.length === 0) return [];

        return result[0].values.map(it => this.buildFullMonster(it));
    }

    async readItemByName(name: string): Promise<FullMonster | null> {
        if (!this.database) return null;
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE rus_name = ? OR eng_name = ?;
        `, [name, name]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const row = result[0].values[0];
        
        return this.buildFullMonster(row);
    }

    async readItemByUrl(url: string): Promise<FullMonster | null> {
        if (!this.database) return null;
        const result = this.database.exec(`
            SELECT * FROM ${this.getTableName()} WHERE url = ;
        `, [url]);
        if (result.length === 0 || result[0].values.length === 0) return null;

        const row = result[0].values[0];
        
        return this.buildFullMonster(row);
    }


    async updateItem(item: FullMonster): Promise<void> {
        if (!this.database) return;
        this.database.exec(
            `UPDATE ${this.getTableName()} SET
                rus_name = ?,
                eng_name = ?,
                type = ?,
                challenge_rating = ?,
                source_short_name = ?,
                source_name = ?,
                group_name = ?,
                group_short_name = ?,
                homebrew = ?,
                size_rus = ?,
                size_eng = ?,
                size_cell = ?,
                experience = ?,
                proficiency_bonus = ?,
                alignment = ?,
                armor_class = ?,
                armors = ?,
                hits_average = ?,
                hits_formula = ?,
                hits_sign = ?,
                hits_bonus = ?,
                speed = ?,
                ability_str = ?,
                ability_dex = ?,
                ability_con = ?,
                ability_int = ?,
                ability_wiz = ?,
                ability_cha = ?,
                saving_throws = ?,
                skills = ?,
                damage_vulnerabilities = ?,
                damage_resistances = ?,
                damage_immunities = ?,
                condition_immunities = ?,
                senses = ?,
                languages = ?,
                feats = ?,
                actions = ?,
                bonus_actions = ?,
                reactions = ?,
                legendary = ?,
                mythic = ?,
                lair = ?,
                tags = ?,
                images = ?
            WHERE url = ?;`,
            [
                item.name.rus,
                item.name.eng,
                item.type,
                item.challengeRating,
                item.source.shortName,
                item.source.name,
                item.source.group.name,
                item.source.group.shortName,
                item.homebrew ? 1 : 0,
                item.size?.rus ?? null,
                item.size?.eng ?? null,
                item.size?.cell ?? null,
                item.experience ?? null,
                item.proficiencyBonus ?? null,
                item.alignment ?? null,
                item.armorClass ?? null,
                JSON.stringify(item.armors ?? []),
                item.hits?.average ?? null,
                item.hits?.formula ?? null,
                item.hits?.sign ?? null,
                item.hits?.bonus ?? null,
                JSON.stringify(item.speed ?? []),
                item.ability?.str ?? null,
                item.ability?.dex ?? null,
                item.ability?.con ?? null,
                item.ability?.int ?? null,
                item.ability?.wiz ?? null,
                item.ability?.cha ?? null,
                JSON.stringify(item.savingThrows ?? []),
                JSON.stringify(item.skills ?? []),
                JSON.stringify(item.damageVulnerabilities ?? []),
                JSON.stringify(item.damageResistances ?? []),
                JSON.stringify(item.damageImmunities ?? []),
                JSON.stringify(item.conditionImmunities ?? []),
                JSON.stringify(item.senses ?? {}),
                JSON.stringify(item.languages ?? []),
                JSON.stringify(item.feats ?? []),
                JSON.stringify(item.actions ?? []),
                JSON.stringify(item.bonusActions ?? []),
                JSON.stringify(item.reactions ?? []),
                JSON.stringify(item.legendary ?? {}),
                JSON.stringify(item.mythic ?? {}),
                JSON.stringify(item.lair ?? {}),
                JSON.stringify(item.tags ?? []),
                JSON.stringify(item.images ?? []),
                item.url
            ]
        );
        console.log(`Updated ${item.url} in ${this.getTableName()}`);
    }


    async deleteItemByName(name: string): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DELETE FROM ${this.getTableName()} WHERE rus_name = ? OR eng_name = ?;
        `, [name, name]);
    }

    async deleteItemByUrl(url: string): Promise<void> {
        if (!this.database) return;
        this.database.exec(`
            DELETE FROM ${this.getTableName()} WHERE url = ?;
        `, [url]);
    }


    // Private methods
    private buildFullMonster(sqlValues: any[]): FullMonster {
        return {
            name: {
                rus: sqlValues[1],
                eng: sqlValues[2]
            },
            type: sqlValues[3],
            challengeRating: sqlValues[4],
            url: sqlValues[5],
            source: {
                shortName: sqlValues[6],
                name: sqlValues[7],
                group: {
                    name: sqlValues[8],
                    shortName: sqlValues[9]
                }
            },
            homebrew: Boolean(sqlValues[10]),
            size: {
                rus: sqlValues[11],
                eng: sqlValues[12],
                cell: sqlValues[13]
            },
            id: sqlValues[0],
            experience: sqlValues[14],
            proficiencyBonus: sqlValues[15],
            alignment: sqlValues[16],
            armorClass: sqlValues[17],
            armors: JSON.parse(sqlValues[18] || '[]'),
            hits: {
                average: sqlValues[19],
                formula: sqlValues[20],
                sign: sqlValues[21],
                bonus: sqlValues[22]
            },
            speed: JSON.parse(sqlValues[23] || '[]'),
            ability: {
                str: sqlValues[24],
                dex: sqlValues[25],
                con: sqlValues[26],
                int: sqlValues[27],
                wiz: sqlValues[28],
                cha: sqlValues[29]
            },
            savingThrows: JSON.parse(sqlValues[30] || '[]'),
            skills: JSON.parse(sqlValues[31] || '[]'),
            damageVulnerabilities: JSON.parse(sqlValues[32] || '[]'),
            damageResistances: JSON.parse(sqlValues[33] || '[]'),
            damageImmunities: JSON.parse(sqlValues[34] || '[]'),
            conditionImmunities: JSON.parse(sqlValues[35] || '[]'),
            senses: JSON.parse(sqlValues[36] || '{}'),
            languages: JSON.parse(sqlValues[37] || '[]'),
            feats: JSON.parse(sqlValues[38] || '[]'),
            actions: JSON.parse(sqlValues[39] || '[]'),
            bonusActions: JSON.parse(sqlValues[40] || '[]'),
            reactions: JSON.parse(sqlValues[41] || '[]'),
            legendary: JSON.parse(sqlValues[42] || '{}'),
            mythic: JSON.parse(sqlValues[43] || '{}'),
            lair: JSON.parse(sqlValues[44] || '{}'),
            tags: JSON.parse(sqlValues[45] || '[]'),
            images: JSON.parse(sqlValues[46] || '[]')
        };
    }
}
