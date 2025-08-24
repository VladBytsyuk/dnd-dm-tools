import { describe, it, expect } from 'vitest';
import type { FullBackground } from '../../../src/domain/models/background/FullBackground';

describe('FullBackground interface', () => {
    it('should correctly type a basic full background without optional properties', () => {
        const basicFullBackground: FullBackground = {
            name: {
                rus: "Агент Голгари",
                eng: "Golgari Agent"
            },
            url: "/backgrounds/fragment/99",
            source: {
                shortName: "GGR",
                name: "Справочник гильдмастера по Равнике",
                group: {
                    name: "Официальные источники",
                    shortName: "Basic"
                }
            },
            skills: ["Выживание", "Природа"],
            toolOwnership: "Инструменты отравителя [poisoner's kit]",
            equipments: [
                "Инсигния Голгари",
                "набор отравителя [poisoner's kit]",
                "питомец жук или паук"
            ],
            startGold: 10,
            description: "Описание предыстории агента Голгари"
        };

        // Test inherited properties from BaseItem and SmallBackground
        expect(basicFullBackground.name.rus).toBe("Агент Голгари");
        expect(basicFullBackground.name.eng).toBe("Golgari Agent");
        expect(basicFullBackground.url).toBe("/backgrounds/fragment/99");
        expect(basicFullBackground.source.shortName).toBe("GGR");
        expect(basicFullBackground.source.name).toBe("Справочник гильдмастера по Равнике");
        expect(basicFullBackground.source.group.name).toBe("Официальные источники");
        expect(basicFullBackground.source.group.shortName).toBe("Basic");

        // Test FullBackground specific properties
        expect(Array.isArray(basicFullBackground.skills)).toBe(true);
        expect(basicFullBackground.skills).toEqual(["Выживание", "Природа"]);
        expect(basicFullBackground.toolOwnership).toBe("Инструменты отравителя [poisoner's kit]");
        expect(Array.isArray(basicFullBackground.equipments)).toBe(true);
        expect(basicFullBackground.equipments).toHaveLength(3);
        expect(basicFullBackground.startGold).toBe(10);
        expect(typeof basicFullBackground.description).toBe('string');
        expect(basicFullBackground.description).toBe("Описание предыстории агента Голгари");

        // Test optional properties are undefined
        expect(basicFullBackground.homebrew).toBeUndefined();
        expect(basicFullBackground.personalization).toBeUndefined();
    });

    it('should correctly type a full background with all optional properties', () => {
        const fullBackgroundWithOptionals: FullBackground = {
            name: {
                rus: "Человек Из Гавани",
                eng: "Harborfolk"
            },
            url: "/backgrounds/fragment/30",
            homebrew: true,
            source: {
                shortName: "ADLA",
                name: "Дополнительные предыстории из ресурсов Лиги Авантюристов",
                group: {
                    name: "Хомбрю ",
                    shortName: "HB"
                },
                homebrew: true
            },
            skills: ["Атлетика", "Лoвкость рук"],
            toolOwnership: "Один игровой набор, транспорт (водный)",
            equipments: [
                "Рыболовные снасти",
                "набор кубиков",
                "колода игральных карт"
            ],
            startGold: 5,
            description: "Описание человека из гавани",
            personalization: "Информация о персонализации фона"
        };

        // Test all required properties
        expect(fullBackgroundWithOptionals.name.rus).toBe("Человек Из Гавани");
        expect(fullBackgroundWithOptionals.skills).toEqual(["Атлетика", "Лoвкость рук"]);
        expect(fullBackgroundWithOptionals.startGold).toBe(5);

        // Test optional properties are present
        expect(fullBackgroundWithOptionals.homebrew).toBe(true);
        expect(fullBackgroundWithOptionals.personalization).toBe("Информация о персонализации фона");
        expect(fullBackgroundWithOptionals.source.homebrew).toBe(true);
    });

    it('should allow empty arrays for skills and equipments', () => {
        const backgroundWithEmptyArrays: FullBackground = {
            name: {
                rus: "Тестовая предыстория",
                eng: "Test Background"
            },
            url: "/backgrounds/test",
            source: {
                shortName: "TEST",
                name: "Тестовый источник",
                group: {
                    name: "Тест",
                    shortName: "T"
                }
            },
            skills: [],
            toolOwnership: "Нет инструментов",
            equipments: [],
            startGold: 0,
            description: "Тестовое описание"
        };

        expect(Array.isArray(backgroundWithEmptyArrays.skills)).toBe(true);
        expect(backgroundWithEmptyArrays.skills).toHaveLength(0);
        expect(Array.isArray(backgroundWithEmptyArrays.equipments)).toBe(true);
        expect(backgroundWithEmptyArrays.equipments).toHaveLength(0);
        expect(backgroundWithEmptyArrays.startGold).toBe(0);
    });

    it('should handle HTML content in description and toolOwnership', () => {
        const backgroundWithHTML: FullBackground = {
            name: {
                rus: "HTML Предыстория",
                eng: "HTML Background"
            },
            url: "/backgrounds/html",
            source: {
                shortName: "HTML",
                name: "HTML источник",
                group: {
                    name: "HTML группа",
                    shortName: "H"
                }
            },
            skills: ["Навык"],
            toolOwnership: "<p><detail-tooltip type=\"screen\"><a href=\"/screens/test\">Тестовые инструменты</a></detail-tooltip></p>",
            equipments: ["<detail-tooltip type=\"item\"><a href=\"/items/test\">тестовый предмет</a></detail-tooltip>"],
            startGold: 10,
            description: "<p>Описание с <strong>HTML</strong> тегами.</p>"
        };

        expect(backgroundWithHTML.toolOwnership).toContain('<detail-tooltip');
        expect(backgroundWithHTML.description).toContain('<p>');
        expect(backgroundWithHTML.description).toContain('<strong>');
        expect(backgroundWithHTML.equipments[0]).toContain('<detail-tooltip');
    });

    it('should properly extend SmallBackground interface', () => {
        const fullBackground: FullBackground = {
            name: {
                rus: "Тест",
                eng: "Test"
            },
            url: "/test",
            source: {
                shortName: "T",
                name: "Test",
                group: {
                    name: "Test Group",
                    shortName: "TG"
                }
            },
            skills: ["Тест"],
            toolOwnership: "Тестовые инструменты",
            equipments: ["Тестовое снаряжение"],
            startGold: 1,
            description: "Тестовое описание"
        };

        // Should be assignable to SmallBackground
        const smallBackground = fullBackground;
        expect(smallBackground.name).toBeDefined();
        expect(smallBackground.url).toBeDefined();
        expect(smallBackground.source).toBeDefined();
        
        // But FullBackground has additional properties
        expect('skills' in fullBackground).toBe(true);
        expect('toolOwnership' in fullBackground).toBe(true);
        expect('equipments' in fullBackground).toBe(true);
        expect('startGold' in fullBackground).toBe(true);
        expect('description' in fullBackground).toBe(true);
    });
});