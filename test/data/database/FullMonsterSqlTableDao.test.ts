import { expect } from 'vitest';
import { FullMonsterSqlTableDao } from '../../../src/data/databse/FullMonsterSqlTableDao';
import type { FullMonster } from '../../../src/domain/models/monster/FullMonster';
import type { BestiaryFilters } from '../../../src/domain/models/monster/BestiaryFilters';
import { runSqlDaoBaseTests } from './Dao';

const sampleMonster: FullMonster = {
    name: { rus: "Гоблин", eng: "Goblin" },
    size: { rus: "Маленький", eng: "small", cell: "1 клетка"},
    type: "гуманоид",
    challengeRating: "1/4",
    url: "/bestiary/goblin",
    source: {
        "shortName":"MM",
        "name":"Бестиарий",
        "group":{
            "name":"Официальные источники",
            "shortName":"Basic"
        }
    },
    "id":38,
    "experience":50,
    "proficiencyBonus":"2",
    "alignment":"нейтрально-злой",
    "armorClass":15,
    "armors":[
        {"name":"кожаный доспех","type":"armor","url":"/armors/leather_armor"},
        {"name":"щит","type":"armor","url":"/armors/shield"}
    ],
    "hits":{"average":7,"formula":"2к6",sign:"+","bonus":0},
    "speed":[{"value":30}],
    "ability":{"str":8,"dex":14,"con":10,"int":10,"wiz":8,"cha":8},
    "skills":[{"name":"Скрытность","value":6}],
    "senses":{
        "passivePerception":"9",
        "senses":[{"name":"тёмное зрение","value":60}]
    },
    "languages":["Гоблинский","Общий"],
    "feats":[
        { "name":"Ловкий побег", "value":"Описание"}
    ],
    "actions":[
        { "name":"Скимитар", "value":"Описание скимитара" },
        { "name":"Короткий лук", "value":"Описание короткого лука" }
    ],
    "description":"Описание",
    "tags":[
        {"name":"Гоблиноиды","description":"Описание гоблиноидов"}
    ],
    "environment":["лес","равнина/луг","холмы","подземье"],
    "images":["https://img.ttg.club/tokens/round/goblin.webp","https://img.ttg.club/creatures/Goblin.webp","http://dm-stuff.ru/static/goblin-61d92358796e12939a8da27012704b3b.jpg","http://dm-stuff.ru/static/goblins-0a2ef40798e6184bafe563249e7e7eb0.png"]
};

const filters: BestiaryFilters = {
    types: ['Гуманоид'],
    challangeRatings: ['1/4'],
    sources: ['MM'],
};

runSqlDaoBaseTests<FullMonster, BestiaryFilters>({
    title: 'FullMonsterSqlTableDao',
    daoFactory: ({ app, db, manifest }) => new FullMonsterSqlTableDao(db),
    sample: sampleMonster,
    filters: filters,
    expected: {
        table: 'full_bestiary',
        fill: false,
        whereClausesCount: 0,
        filterParams: [],
    },
    mutate: (monster) => ({
        ...monster,
        name: { ...monster.name, rus: 'Гоблин-воин' }
    }),
    mapCase: {
        sqlValues: [
            1,
            sampleMonster.name.rus,
            sampleMonster.name.eng,
            JSON.stringify(sampleMonster.type),
            sampleMonster.challengeRating,
            sampleMonster.url,
            sampleMonster.source.shortName,
            sampleMonster.source.name,
            sampleMonster.source.group.name,
            sampleMonster.source.group.shortName,
            sampleMonster.source.homebrew ? 1 : 0,
            sampleMonster.size?.rus ?? null,
            sampleMonster.size?.eng ?? null,
            sampleMonster.size?.cell ?? null,
            sampleMonster.experience ?? null,
            sampleMonster.proficiencyBonus ?? null,
            sampleMonster.alignment ?? null,
            sampleMonster.armorClass ?? null,
            JSON.stringify(sampleMonster.armors ?? []),
            sampleMonster.hits?.average ?? null,
            sampleMonster.hits?.formula ?? null,
            sampleMonster.hits?.sign ?? null,
            sampleMonster.hits?.bonus ?? null,
            JSON.stringify(sampleMonster.speed ?? []),
            sampleMonster.ability?.str ?? null,
            sampleMonster.ability?.dex ?? null,
            sampleMonster.ability?.con ?? null,
            sampleMonster.ability?.int ?? null,
            sampleMonster.ability?.wiz ?? null,
            sampleMonster.ability?.cha ?? null,
            JSON.stringify(sampleMonster.savingThrows ?? []),
            JSON.stringify(sampleMonster.skills ?? []),
            JSON.stringify(sampleMonster.damageVulnerabilities ?? []),
            JSON.stringify(sampleMonster.damageResistances ?? []),
            JSON.stringify(sampleMonster.damageImmunities ?? []),
            JSON.stringify(sampleMonster.conditionImmunities ?? []),
            JSON.stringify(sampleMonster.senses ?? {}),
            JSON.stringify(sampleMonster.languages ?? []),
            JSON.stringify(sampleMonster.feats ?? []),
            JSON.stringify(sampleMonster.actions ?? []),
            JSON.stringify(sampleMonster.bonusActions ?? []),
            JSON.stringify(sampleMonster.reactions ?? []),
            JSON.stringify(sampleMonster.legendary ?? {}),
            JSON.stringify(sampleMonster.mythic ?? {}),
            JSON.stringify(sampleMonster.lair ?? {}),
            JSON.stringify(sampleMonster.tags ?? []),
            JSON.stringify(sampleMonster.images ?? [])
        ],
        assert: (monster) => {
            expect(monster.name.rus).toStrictEqual(sampleMonster.name.rus);
            expect(monster.name.eng).toStrictEqual(sampleMonster.name.eng);
            expect(monster.type).toStrictEqual(sampleMonster.type);
            expect(monster.challengeRating).toStrictEqual(sampleMonster.challengeRating);
            expect(monster.url).toStrictEqual(sampleMonster.url);
            expect(monster.source.shortName).toStrictEqual(sampleMonster.source.shortName);
            expect(monster.source.name).toStrictEqual(sampleMonster.source.name);
            expect(monster.source.group.name).toStrictEqual(sampleMonster.source.group.name);
            expect(monster.source.group.shortName).toStrictEqual(sampleMonster.source.group.shortName);
            expect(monster.source.homebrew).toStrictEqual(sampleMonster.source.homebrew);
            expect(monster.size?.rus).toStrictEqual(sampleMonster.size?.rus);
            expect(monster.size?.eng).toStrictEqual(sampleMonster.size?.eng);
            expect(monster.size?.cell).toStrictEqual(sampleMonster.size?.cell);
            expect(monster.experience).toStrictEqual(sampleMonster.experience);
            expect(monster.proficiencyBonus).toStrictEqual(sampleMonster.proficiencyBonus);
            expect(monster.alignment).toStrictEqual(sampleMonster.alignment);
            expect(monster.armorClass).toStrictEqual(sampleMonster.armorClass);
            expect(monster.armors).toStrictEqual(sampleMonster.armors ?? []);
            expect(monster.hits?.average).toStrictEqual(sampleMonster.hits?.average);
            expect(monster.hits?.formula).toStrictEqual(sampleMonster.hits?.formula);
            expect(monster.hits?.sign).toStrictEqual(sampleMonster.hits?.sign);
            expect(monster.hits?.bonus).toStrictEqual(sampleMonster.hits?.bonus);
            expect(monster.speed).toStrictEqual(sampleMonster.speed ?? []);
            expect(monster.ability?.str).toStrictEqual(sampleMonster.ability?.str);
            expect(monster.ability?.dex).toStrictEqual(sampleMonster.ability?.dex);
            expect(monster.ability?.con).toStrictEqual(sampleMonster.ability?.con);
            expect(monster.ability?.int).toStrictEqual(sampleMonster.ability?.int);
            expect(monster.ability?.wiz).toStrictEqual(sampleMonster.ability?.wiz);
            expect(monster.ability?.cha).toStrictEqual(sampleMonster.ability?.cha);
            expect(monster.savingThrows).toStrictEqual(sampleMonster.savingThrows ?? []);
            expect(monster.skills).toStrictEqual(sampleMonster.skills ?? []);
            expect(monster.damageVulnerabilities).toStrictEqual(sampleMonster.damageVulnerabilities ?? []);
            expect(monster.damageResistances).toStrictEqual(sampleMonster.damageResistances ?? []);
            expect(monster.damageImmunities).toStrictEqual(sampleMonster.damageImmunities ?? []);
            expect(monster.conditionImmunities).toStrictEqual(sampleMonster.conditionImmunities ?? []);
            expect(monster.senses).toStrictEqual(sampleMonster.senses ?? {});
            expect(monster.languages).toStrictEqual(sampleMonster.languages ?? []);
            expect(monster.feats).toStrictEqual(sampleMonster.feats ?? []);
            expect(monster.actions).toStrictEqual(sampleMonster.actions ?? []);
            expect(monster.bonusActions).toStrictEqual(sampleMonster.bonusActions ?? []);
            expect(monster.reactions).toStrictEqual(sampleMonster.reactions ?? []);
            expect(monster.legendary).toStrictEqual(sampleMonster.legendary ?? {});
            expect(monster.mythic).toStrictEqual(sampleMonster.mythic ?? {});
            expect(monster.lair).toStrictEqual(sampleMonster.lair ?? {});
            expect(monster.tags).toStrictEqual(sampleMonster.tags ?? []);
            expect(monster.images).toStrictEqual(sampleMonster.images ?? []);
        }
    }
});
