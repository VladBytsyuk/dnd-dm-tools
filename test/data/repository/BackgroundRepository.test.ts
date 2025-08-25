import { BackgroundRepository } from "../../../src/data/repositories/BackgroundRepository";
import type { SmallBackground } from "../../../src/domain/models/background/SmallBackground";
import type { FullBackground } from "../../../src/domain/models/background/FullBackground";
import type { BackgroundsFilters } from "../../../src/domain/models/background/BackgroundsFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import {
    backgroundsFilters,
    backgroundsFiltersWithAsterisks,
    smallBackgroundGolgariAgent,
    smallBackgroundOccultist,
    smallBackgroundHarborfolk
} from "../../__mocks__/domain/models/background/small_background_items";
import {
    fullBackgroundGolgariAgent,
    fullBackgroundOccultist,
    fullBackgroundHarborfolk
} from "../../__mocks__/domain/models/background/full_background_items";

runBaseRepositoryTests<SmallBackground, FullBackground, BackgroundsFilters>({
    title: 'Repository: Background',
    repoFactory: () => new BackgroundRepository(
        mockDatabase(
            [smallBackgroundGolgariAgent, smallBackgroundOccultist, smallBackgroundHarborfolk],
            [fullBackgroundGolgariAgent, fullBackgroundOccultist, fullBackgroundHarborfolk],
        )
    ),
    expectedAllFilters: backgroundsFiltersWithAsterisks,
    expectedAllSmallItems: [smallBackgroundGolgariAgent, smallBackgroundOccultist, smallBackgroundHarborfolk],
    expectedFilteredByNameItems: {
        name: 'Агент Голгари',
        smallItems: [smallBackgroundGolgariAgent],
    },
    expectedSmallItemNames: ['Агент Голгари', 'Оккультист', 'Человек Из Гавани'],
    expectedFullItemByName: {
        name: 'Оккультист',
        item: fullBackgroundOccultist as FullBackground,
    },
    expectedFullItemByUrl: {
        url: '/backgrounds/harborfolk',
        item: fullBackgroundHarborfolk as FullBackground,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallBackgroundHarborfolk as SmallBackground,
        fullItem: fullBackgroundHarborfolk as FullBackground,
    }
});