import type { Database, SqlValue } from 'sql.js';
import type { FullMonster } from "src/domain/monster";
import { SqlTableDao } from "./SqlTableDao";

export class FullMonsterSqlTableDao extends SqlTableDao<FullMonster, any> {

    constructor(
        database: Database,
    ) {
        super(database);
    }

    getTableName(): string {
        return 'full_bestiary';
    }

    // Table management
    async createTable(): Promise<void> {
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

    // CRUD operations
    async createItem(item: FullMonster): Promise<void> {
        const existing = this.database.exec(
            `SELECT 1 FROM ${this.getTableName()} WHERE url = ? LIMIT 1;`,
            [item.url]
        );
        if (existing.length > 0 && existing[0].values.length > 0) {
            console.warn(`Item with url ${item.url} already exists in ${this.getTableName()}. Skipping creation.`);
            return;
        }
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

    async updateItem(item: FullMonster): Promise<void> {
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

    // Mapper
    mapSqlValues(sqlValues: SqlValue[]): FullMonster {
        return {
            name: {
                rus: sqlValues[1] as string,
                eng: sqlValues[2] as string,
            },
            type: sqlValues[3] as string,
            challengeRating: sqlValues[4] as string,
            url: sqlValues[5] as string,
            source: {
                shortName: sqlValues[6] as string,
                name: sqlValues[7] as string,
                group: {
                    name: sqlValues[8] as string,
                    shortName: sqlValues[9] as string,
                }
            },
            homebrew: Boolean(sqlValues[10]),
            size: {
                rus: sqlValues[11] as string,
                eng: sqlValues[12] as string,
                cell: sqlValues[13] as string,
            },
            id: sqlValues[0] as number,
            experience: sqlValues[14] as number,
            proficiencyBonus: sqlValues[15] as string,
            alignment: sqlValues[16] as string,
            armorClass: sqlValues[17] as number,
            armors: JSON.parse(sqlValues[18] as string || '[]'),
            hits: {
                average: sqlValues[19] as number,
                formula: sqlValues[20] as string,
                sign: sqlValues[21] as string,
                bonus: sqlValues[22] as number,
            },
            speed: JSON.parse(sqlValues[23] as string || '[]') as Speed[],
            ability: {
                str: sqlValues[24] as number,
                dex: sqlValues[25] as number,
                con: sqlValues[26] as number,
                int: sqlValues[27] as number,
                wiz: sqlValues[28] as number,
                cha: sqlValues[29] as number,
            },
            savingThrows: JSON.parse(sqlValues[30] as string || '[]'),
            skills: JSON.parse(sqlValues[31] as string || '[]'),
            damageVulnerabilities: JSON.parse(sqlValues[32] as string || '[]'),
            damageResistances: JSON.parse(sqlValues[33] as string || '[]'),
            damageImmunities: JSON.parse(sqlValues[34] as string || '[]'),
            conditionImmunities: JSON.parse(sqlValues[35] as string || '[]'),
            senses: JSON.parse(sqlValues[36] as string || '{}'),
            languages: JSON.parse(sqlValues[37] as string || '[]'),
            feats: JSON.parse(sqlValues[38] as string || '[]'),
            actions: JSON.parse(sqlValues[39] as string || '[]'),
            bonusActions: JSON.parse(sqlValues[40] as string || '[]'),
            reactions: JSON.parse(sqlValues[41] as string || '[]'),
            legendary: JSON.parse(sqlValues[42] as string || '{}'),
            mythic: JSON.parse(sqlValues[43] as string || '{}'),
            lair: JSON.parse(sqlValues[44] as string || '{}'),
            tags: JSON.parse(sqlValues[45] as string || '[]'),
            images: JSON.parse(sqlValues[46] as string || '[]')
        };
    }
}
