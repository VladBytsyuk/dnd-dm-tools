import type { SmallRace } from "../../../../../src/domain/models/race/SmallRace";
import type { RaceFilters } from "../../../../../src/domain/models/race/RaceFilters";

export const smallRace1: SmallRace = {
    name: { rus: 'Эльф', eng: 'Elf' },
    url: '/races/elf',
    abilities: [
        { key: 'dexterity', value: 2, shortName: 'Лвк' },
    ],
    type: { name: 'Базовая', order: 1 },
    source: {
        shortName: 'PHB',
        name: "Player's Handbook",
        group: { name: 'Basic', shortName: 'Basic' },
        homebrew: false,
    },
    image: 'elf.png',
    group: { name: 'Основные', order: 1 },
};

export const smallRace2: SmallRace = {
    name: { rus: 'Дварф', eng: 'Dwarf' },
    url: '/races/dwarf',
    abilities: [
        { key: 'constitution', value: 2, shortName: 'Тел' },
    ],
    type: { name: 'Базовая', order: 1 },
    source: {
        shortName: 'PHB',
        name: "Player's Handbook",
        group: { name: 'Basic', shortName: 'Basic' },
        homebrew: false,
    },
};

export const smallRace3: SmallRace = {
    name: { rus: 'Тифлинг', eng: 'Tiefling' },
    url: '/races/tiefling',
    abilities: [
        { key: 'charisma', value: 2, shortName: 'Хар' },
        { key: 'intelligence', value: 1, shortName: 'Инт' },
    ],
    type: { name: 'Редкая', order: 2 },
    source: {
        shortName: 'XGE',
        name: "Xanathar's Guide to Everything",
        group: { name: 'Supplements', shortName: 'S' },
        homebrew: false,
    },
};

// Subrace examples
export const smallRace1Subrace: SmallRace = {
    name: { rus: 'Высший эльф', eng: 'High Elf' },
    url: '/races/high-elf',
    abilities: [
        { key: 'intelligence', value: 1, shortName: 'Инт' },
    ],
    type: { name: 'Базовая', order: 1 },
    source: {
        shortName: 'PHB',
        name: "Player's Handbook",
        group: { name: 'Basic', shortName: 'Basic' },
        homebrew: false,
    },
};

export const smallRace1SubraceLevel2: SmallRace = {
    name: { rus: 'Лунный эльф', eng: 'Moon Elf' },
    url: '/races/moon-elf',
    abilities: [],
    type: { name: 'Базовая' },
    source: {
        shortName: 'PHB',
        name: "Player's Handbook",
        group: { name: 'Basic', shortName: 'Basic' },
        homebrew: false,
    },
};

// Full filters (for repository tests)
export const raceFilters: RaceFilters = {
    abilities: ['charisma', 'constitution', 'dexterity', 'intelligence'],
    types: ['Базовая', 'Редкая'],
    sources: ['PHB', 'XGE*'],
};

// Single filter (for DAO tests)
export const singleRaceFilter: RaceFilters = {
    abilities: ['dexterity'],
    types: ['Базовая'],
    sources: ['PHB'],
};
