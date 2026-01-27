import type { FullRace } from "../../../../../src/domain/models/race/FullRace";

export const fullRace1: FullRace = {
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
    description: 'Эльфы — изящная раса с острым умом и великолепным владением магией.',
    size: 'Средний',
    speed: [{ name: 'Ходьба', value: 30 }],
    skills: [{ name: 'Восприятие', value: 'Владение' }],
};

export const fullRace2: FullRace = {
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
    description: 'Дварфы — крепкие и выносливые существа, живущие в горных крепостях.',
    size: 'Средний',
    speed: [{ name: 'Ходьба', value: 25 }],
    skills: [],
};

export const fullRace3: FullRace = {
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
    description: 'Тифлинги — потомки людей и дьяволов, несущие печать инфернального наследия.',
    size: 'Средний',
    speed: [{ name: 'Ходьба', value: 30 }],
    skills: [],
};

export const fullRace1Subrace: FullRace = {
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
    description: 'Высшие эльфы владеют врождённой магией и любят изучать тайные искусства.',
    size: 'Средний',
    speed: [{ name: 'Ходьба', value: 30 }],
    skills: [],
};
