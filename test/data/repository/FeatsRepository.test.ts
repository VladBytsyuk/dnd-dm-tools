import { describe, it, expect } from 'vitest';
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

describe('FeatsRepository - Source-based Grouping', () => {
    it('should group feats by source', async () => {
        const phbFeat = { ...smallFeat1, source: { ...smallFeat1.source, shortName: 'PHB', name: 'Player\'s Handbook' } };
        const xgeFeat = { ...smallFeat2, source: { ...smallFeat2.source, shortName: 'XGE', name: 'Xanathar\'s Guide' } };
        const feats = [xgeFeat, phbFeat];
        const mockDb = mockDatabase(feats, []);
        const repo = new FeatsRepository(mockDb);

        const groups = await repo.groupItems(feats as SmallFeat[]);

        expect(groups.length).toBe(2);
        expect(groups.some(g => g.sort === 'Player\'s Handbook')).toBe(true);
        expect(groups.some(g => g.sort === 'Xanathar\'s Guide')).toBe(true);
    });

    it('should sort groups using source priority (PHB, XGE, TCE first)', async () => {
        const scagFeat = {
            ...smallFeat1,
            source: {
                shortName: 'SCAG',
                name: 'Sword Coast Adventurer\'s Guide',
                group: { name: 'Official', shortName: 'Basic' },
                homebrew: false
            }
        };
        const xgeFeat = {
            ...smallFeat2,
            source: {
                shortName: 'XGE',
                name: 'Xanathar\'s Guide',
                group: { name: 'Official', shortName: 'Basic' },
                homebrew: false
            }
        };
        const phbFeat = {
            ...smallFeat3,
            source: {
                shortName: 'PHB',
                name: 'Player\'s Handbook',
                group: { name: 'Official', shortName: 'Basic' },
                homebrew: false
            }
        };
        const feats = [scagFeat, xgeFeat, phbFeat];
        const mockDb = mockDatabase(feats, []);
        const repo = new FeatsRepository(mockDb);

        const groups = await repo.groupItems(feats as SmallFeat[]);

        // Should be ordered: PHB, XGE, SCAG (alphabetically after priority)
        expect(groups[0].sort).toBe('Player\'s Handbook');
        expect(groups[1].sort).toBe('Xanathar\'s Guide');
        expect(groups[2].sort).toBe('Sword Coast Adventurer\'s Guide');
    });

    it('should place homebrew sources at the end', async () => {
        const phbFeat = {
            ...smallFeat1,
            source: {
                shortName: 'PHB',
                name: 'Player\'s Handbook',
                group: { name: 'Official', shortName: 'Basic' },
                homebrew: false
            }
        };
        const homebrewFeat = {
            ...smallFeat2,
            source: {
                shortName: 'HB',
                name: 'Homebrew Content',
                group: { name: 'Homebrew', shortName: 'HB' },
                homebrew: true
            }
        };
        const feats = [homebrewFeat, phbFeat];
        const mockDb = mockDatabase(feats, []);
        const repo = new FeatsRepository(mockDb);

        const groups = await repo.groupItems(feats as SmallFeat[]);

        // PHB should come before homebrew
        expect(groups[0].sort).toBe('Player\'s Handbook');
        expect(groups[1].sort).toBe('Homebrew Content');
    });
});
