import { BackgroundRepository } from "../../../src/data/repositories/BackgroundRepository";
import type { SmallBackground } from "../../../src/domain/models/background/SmallBackground";
import type { FullBackground } from "../../../src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "../../../src/domain/models/background/BackgroundsFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

// Create test data specifically for the repository tests with consistent URLs
const testSmallBackgroundGolgari: SmallBackground = {
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
};

const testSmallBackgroundOccultist: SmallBackground = {
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
};

const testSmallBackgroundHarborfolk: SmallBackground = {
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
};

const testFullBackgroundGolgari: FullBackground = {
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
    },
    "skills": ["Выживание", "Природа"],
    "toolOwnership": "Инструменты отравителя",
    "equipments": ["Инсигния Голгари", "набор отравителя"],
    "startGold": 10,
    "description": "Вы — член многочисленной орды",
    "personalization": "Члены Роя Голгари"
};

const testFullBackgroundOccultist: FullBackground = {
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
    },
    "skills": ["Магия", "Религия"],
    "toolOwnership": "Воровские инструменты",
    "equipments": ["Книга с тайными преданиями", "фонарь обнаружения"],
    "startGold": 5,
    "description": "В глубине души вы верите",
    "personalization": "Оккультисты не могут устоять"
};

const testFullBackgroundHarborfolk: FullBackground = {
    "name": {
        "rus": "Человек Из Гавани",
        "eng": "Harborfolk"
    },
    "url": "/backgrounds/harborfolk",
    "source": {
        "shortName": "ADLA",
        "name": "Дополнительные предыстории из ресурсов Лиги Авантюристов",
        "group": {
            "name": "Хомбрю ",
            "shortName": "HB"
        },
        "homebrew": true
    },
    "skills": ["Атлетика", "Лoвкость рук"],
    "toolOwnership": "Один игровой набор, транспорт (водный)",
    "equipments": ["Рыболовные снасти", "каноэ и поясной кошель"],
    "startGold": 5,
    "description": "Вы один из сотен незначительных рыбаков"
};

const testBackgroundsFilters: BackgroundsFilters = {
    sources: ["GGR", "ToH*", "ADLA*"]
};

runBaseRepositoryTests<SmallBackground, FullBackground, BackgroundsFilters>({
    title: 'Repository: Background',
    repoFactory: () => new BackgroundRepository(
        mockDatabase(
            [testSmallBackgroundGolgari, testSmallBackgroundOccultist, testSmallBackgroundHarborfolk],
            [testFullBackgroundGolgari, testFullBackgroundOccultist, testFullBackgroundHarborfolk],
        )
    ),
    expectedAllFilters: testBackgroundsFilters,
    expectedAllSmallItems: [testSmallBackgroundGolgari, testSmallBackgroundOccultist, testSmallBackgroundHarborfolk],
    expectedFilteredByNameItems: {
        name: 'Агент Голгари',
        smallItems: [testSmallBackgroundGolgari],
    },
    expectedSmallItemNames: ['Агент Голгари', 'Оккультист', 'Человек Из Гавани'],
    expectedFullItemByName: {
        name: 'Оккультист',
        item: testFullBackgroundOccultist as FullBackground,
    },
    expectedFullItemByUrl: {
        url: '/backgrounds/harborfolk',
        item: testFullBackgroundHarborfolk as FullBackground,
    },
    expectedFullItemBySmallItem: {
        smallItem: testSmallBackgroundHarborfolk as SmallBackground,
        fullItem: testFullBackgroundHarborfolk as FullBackground,
    }
});