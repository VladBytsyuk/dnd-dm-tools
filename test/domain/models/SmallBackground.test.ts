import { describe, it, expect } from 'vitest';
import type { SmallBackground } from '../../../src/domain/models/background/SmallBackground';

describe('SmallBackground interface', () => {
    it('should correctly type basic backgrounds from JSON structure', () => {
        // Sample data from backgrounds.json - without homebrew
        const basicBackground: SmallBackground = {
            name: {
                rus: "Агент Голгари",
                eng: "Golgari Agent"
            },
            url: "/backgrounds/golgari_agent",
            source: {
                shortName: "GGR",
                name: "Справочник гильдмастера по Равнике",
                group: {
                    name: "Официальные источники",
                    shortName: "Basic"
                }
            }
        };

        expect(basicBackground.name.rus).toBe("Агент Голгари");
        expect(basicBackground.name.eng).toBe("Golgari Agent");
        expect(basicBackground.url).toBe("/backgrounds/golgari_agent");
        expect(basicBackground.source.shortName).toBe("GGR");
        expect(basicBackground.source.name).toBe("Справочник гильдмастера по Равнике");
        expect(basicBackground.source.group.name).toBe("Официальные источники");
        expect(basicBackground.source.group.shortName).toBe("Basic");
    });

    it('should correctly type homebrew backgrounds from JSON structure', () => {
        // Sample data from backgrounds.json - with homebrew
        const homebrewBackground: SmallBackground = {
            name: {
                rus: "Аристократ Мулмастера",
                eng: "Mulmaster Aristocrat"
            },
            url: "/backgrounds/mulmaster_aristocrat",
            source: {
                shortName: "ADLA",
                name: "Дополнительные предыстории из ресурсов Лиги Авантюристов",
                group: {
                    name: "Хомбрю ",
                    shortName: "HB"
                },
                homebrew: true
            }
        };

        expect(homebrewBackground.name.rus).toBe("Аристократ Мулмастера");
        expect(homebrewBackground.name.eng).toBe("Mulmaster Aristocrat");
        expect(homebrewBackground.url).toBe("/backgrounds/mulmaster_aristocrat");
        expect(homebrewBackground.source.shortName).toBe("ADLA");
        expect(homebrewBackground.source.name).toBe("Дополнительные предыстории из ресурсов Лиги Авантюристов");
        expect(homebrewBackground.source.group.name).toBe("Хомбрю ");
        expect(homebrewBackground.source.group.shortName).toBe("HB");
        expect(homebrewBackground.source.homebrew).toBe(true);
    });
});