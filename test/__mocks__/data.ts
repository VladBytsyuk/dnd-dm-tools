import type { FullMonster } from "src/domain/models/monster/FullMonster";
import type { Encounter } from "src/domain/models/encounter/Encounter";
import type { FullSpell } from "src/domain/models/spell/FullSpell";
import type { DmScreenItem } from "src/domain/models/dm_screen/DmScreenItem";
import type { FullWeapon } from "src/domain/models/weapon/FullWeapon";
import type { FullArmor } from "src/domain/models/armor/FullArmor";
import type { FullItem } from "src/domain/models/items/FullItem";
import type { FullArtifact } from "src/domain/models/artifact/FullArtifact";
import type { FullBackground } from "src/domain/models/background/FullBackground";

export const mockMonster: FullMonster = {
    name: {
        rus: "Тестовый монстр",
        eng: "Test Monster"
    },
    size: {
        rus: "Средний",
        eng: "Medium"
    },
    type: {
        rus: "гуманоид",
        eng: "humanoid"
    },
    alignment: {
        rus: "хаотично-злой",
        eng: "chaotic evil"
    },
    armorClass: 15,
    armorType: "естественный доспех",
    hits: {
        average: 10,
        dice: "2d8+2"
    },
    speed: {
        walk: 30
    },
    ability: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    },
    savingThrows: [],
    skills: [],
    senses: {
        passivePerception: 10
    },
    languages: [],
    challengeRating: {
        value: 1,
        experience: 200
    },
    abilities: [],
    actions: [],
    lair: null,
    source: {
        shortName: "MM",
        fullName: "Monster Manual"
    },
    tags: [],
    url: "/bestiary/test-monster",
    image: null
};

export const mockEncounter: Encounter = {
    name: "Тестовое столкновение",
    participants: []
};

export const mockSpell: FullSpell = {
    name: {
        rus: "Тестовое заклинание",
        eng: "Test Spell"
    },
    level: 1,
    school: "Evocation",
    castingTime: "1 действие",
    range: "60 футов",
    components: "V, S",
    duration: "Мгновенная",
    description: "Тестовое описание",
    source: {
        shortName: "PHB",
        fullName: "Player's Handbook"
    },
    url: "/spells/test-spell"
};

export const mockDmScreenItem: DmScreenItem = {
    name: {
        rus: "Тестовый элемент",
        eng: "Test Item"
    },
    description: "Тестовое описание",
    icon: "test-icon"
};

export const mockWeapon: FullWeapon = {
    name: {
        rus: "Тестовое оружие",
        eng: "Test Weapon"
    },
    type: "Простое рукопашное",
    damage: "1d6",
    damageType: "дробящий",
    properties: [],
    cost: "1 gp",
    weight: "2 фнт.",
    source: {
        shortName: "PHB",
        fullName: "Player's Handbook"
    },
    url: "/weapons/test-weapon"
};

export const mockArmor: FullArmor = {
    name: {
        rus: "Тестовая броня",
        eng: "Test Armor"
    },
    type: "Легкий доспех",
    armorClass: "11 + модификатор Ловкости",
    stealthDisadvantage: false,
    cost: "10 gp",
    weight: "8 фнт.",
    source: {
        shortName: "PHB",
        fullName: "Player's Handbook"
    },
    url: "/armors/test-armor"
};

export const mockEquipment: FullItem = {
    name: {
        rus: "Тестовое снаряжение",
        eng: "Test Equipment"
    },
    type: "Снаряжение",
    description: "Тестовое описание",
    cost: "1 gp",
    weight: "1 фнт.",
    source: {
        shortName: "PHB",
        fullName: "Player's Handbook"
    },
    url: "/items/test-equipment"
};

export const mockArtifact: FullArtifact = {
    name: {
        rus: "Тестовый артефакт",
        eng: "Test Artifact"
    },
    type: "Чудесный предмет",
    rarity: "легендарный",
    description: "Тестовое описание",
    source: {
        shortName: "DMG",
        fullName: "Dungeon Master's Guide"
    },
    url: "/artifacts/test-artifact"
};

export const mockBackground: FullBackground = {
    name: {
        rus: "Тестовая предыстория",
        eng: "Test Background"
    },
    description: "Тестовое описание",
    skillProficiencies: "Атлетика, Запугивание",
    toolProficiencies: "Игровой набор (карты), инструменты вора",
    languages: "Один на выбор",
    equipment: "Ломик, комплект темной обычной одежды, включающий капюшон, и кошель с 15 зм",
    feature: {
        name: "Преступные связи",
        description: "Тестовое описание"
    },
    source: {
        shortName: "PHB",
        fullName: "Player's Handbook"
    },
    url: "/backgrounds/test-background"
};
