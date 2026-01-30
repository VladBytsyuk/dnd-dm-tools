
import { BackgroundsFilters } from "../../../../../src/domain/models/background/BackgroundsFilters";
import { SmallBackground } from "../../../../../src/domain/models/background/SmallBackground"

export const backgroundsFilters = {
    sources: ["GGR", "ToH", "ADLA"]
} as BackgroundsFilters;

export const backgroundsFiltersWithAsterisks = {
    sources: ["GGR", "ADLA*", "ToH*"]
} as BackgroundsFilters;

export const smallBackgroundGolgariAgent = {
    "name": {
        "rus": "Агент Голгари",
        "eng": "Golgari Agent"
    },
    "url": "/backgrounds/golgari_agent",
    "source": {
        "shortName": "GGR",
        "name": "Справочник гильдмастера по Равнике",
        "group": {
            "name": "Официальные источники",
            "shortName": "Basic"
        }
    }
} as SmallBackground;

export const smallBackgroundOccultist = {
    "name": {
        "rus": "Оккультист",
        "eng": "Occultist"
    },
    "url": "/backgrounds/occultist",
    "source": {
        "shortName": "ToH",
        "name": "Фолиант героев",
        "group": {
            "name": "Контент от третьих лиц",
            "shortName": "3rd"
        }
    }
} as SmallBackground;

export const smallBackgroundHarborfolk = {
    "name": {
        "rus": "Человек Из Гавани",
        "eng": "Harborfolk"
    },
    "url": "/backgrounds/harborfolk",
    "homebrew": true,
    "source": {
        "shortName": "ADLA",
        "name": "Дополнительные предыстории из ресурсов Лиги Авантюристов",
        "group": {
            "name": "Хомбрю ",
            "shortName": "HB"
        },
        "homebrew": true
    }
} as SmallBackground;
