import { FeatsRepository } from "../../../src/data/repositories/FeatsRepository";
import type { SmallFeat } from "../../../src/domain/models/feat/SmallFeat";
import type { FullFeat } from "../../../src/domain/models/feat/FullFeat";
import type { FeatsFilters } from "../../../src/domain/models/feat/FeatsFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { featsFilters, smallFeat1, smallFeat2, smallFeat3 } from "../../__mocks__/domain/models/feat/small_feat_items";
import { fullFeat1, fullFeat2, fullFeat3 } from "../../__mocks__/domain/models/feat/full_feat_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallFeat, FullFeat, FeatsFilters>({
    title: 'Repository: Feats',
    repoFactory: () => new FeatsRepository(
        mockDatabase(
            [smallFeat1, smallFeat2, smallFeat3],
            [fullFeat1, fullFeat2, fullFeat3],
        )
    ),
    expectedAllFilters: featsFilters,
    expectedAllSmallItems: [smallFeat1, smallFeat2, smallFeat3],
    expectedFilteredByNameItems: {
        name: 'Меткий стрелок',
        smallItems: [smallFeat2],
    },
    expectedSmallItemNames: ['Вдохновляющий лидер', 'Меткий стрелок', 'Адепт стихий'],
    expectedFullItemByName: {
        name: 'Адепт стихий',
        item: fullFeat3 as FullFeat,
    },
    expectedFullItemByUrl: {
        url: '/feats/inspiring-leader',
        item: fullFeat1 as FullFeat,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallFeat2 as SmallFeat,
        fullItem: fullFeat2 as FullFeat,
    }
});
