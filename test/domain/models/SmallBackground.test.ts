import { describe, it, expect } from 'vitest';
import type { SmallBackground } from '../../../src/domain/models/background/SmallBackground';

describe('SmallBackground interface', () => {
    it('should correctly type backgrounds from JSON structure', () => {
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

        expect(basicBackground.name.rus).toBe("Агент Голгари");
        expect(basicBackground.name.eng).toBe("Golgari Agent");
        expect(basicBackground.url).toBe("/backgrounds/golgari_agent");
        expect(basicBackground.source.shortName).toBe("GGR");

        expect(homebrewBackground.source.homebrew).toBe(true);
    });
});