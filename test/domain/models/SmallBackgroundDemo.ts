import type { SmallBackground } from '../../../src/domain/models/background/SmallBackground';

// This function demonstrates how SmallBackground interface can be used 
// to parse and validate backgrounds from the JSON file
export function parseBackgroundFromJson(jsonData: any): SmallBackground {
    const background: SmallBackground = {
        name: {
            rus: jsonData.name.rus,
            eng: jsonData.name.eng
        },
        url: jsonData.url,
        source: {
            shortName: jsonData.source.shortName,
            name: jsonData.source.name,
            group: {
                name: jsonData.source.group.name,
                shortName: jsonData.source.group.shortName
            },
            ...(jsonData.source.homebrew && { homebrew: jsonData.source.homebrew })
        },
        ...(jsonData.homebrew && { homebrew: jsonData.homebrew })
    };

    return background;
}

// Example usage with actual data from backgrounds.json
export const exampleBackgrounds: SmallBackground[] = [
    {
        name: { rus: "Агент Голгари", eng: "Golgari Agent" },
        url: "/backgrounds/golgari_agent",
        source: {
            shortName: "GGR",
            name: "Справочник гильдмастера по Равнике",
            group: { name: "Официальные источники", shortName: "Basic" }
        }
    },
    {
        name: { rus: "Аристократ Мулмастера", eng: "Mulmaster Aristocrat" },
        url: "/backgrounds/mulmaster_aristocrat",
        homebrew: true,
        source: {
            shortName: "ADLA",
            name: "Дополнительные предыстории из ресурсов Лиги Авантюристов",
            group: { name: "Хомбрю ", shortName: "HB" },
            homebrew: true
        }
    }
];