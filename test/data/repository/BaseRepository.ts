import { expect, describe, it, beforeEach, vi } from 'vitest';
import type { BaseItem } from "../../../src/domain/models/common/BaseItem";
import type { Repository } from "../../../src/domain/repositories/Repository";
import { Filters } from '../../../src/domain/models/common/Filters';

export interface BaseRepositoryTestArgs<
    SmallItem extends BaseItem, 
    FullItem extends SmallItem, 
    Filter extends Filters,
> {
    title: string;
    repoFactory: () => Repository<SmallItem, FullItem, Filter>;
    expectedAllFilters: Filter;
    expectedAllSmallItems: SmallItem[];
    expectedFilteredByNameItems: {
        name: string;
        smallItems: SmallItem[];
    };
    expectedSmallItemNames: string[];
    expectedFullItemByName: {
        name: string;
        item: FullItem;
    };
    expectedFullItemByUrl: {
        url: string;
        item: FullItem;
    };
    expectedFullItemBySmallItem: {
        smallItem: SmallItem;
        fullItem: FullItem;
    };
}

export function runBaseRepositoryTests<
    SmallItem extends BaseItem, 
    FullItem extends SmallItem, 
    Filter extends Filters,
>(cfg: BaseRepositoryTestArgs<SmallItem, FullItem, Filter>) {
    describe(cfg.title, () => {
        let repo: Repository<SmallItem, FullItem, Filter>;

        beforeEach(() => {
            repo = cfg.repoFactory();
        });

        // Test initialize method
        it('should initialize repository', async () => {
            await repo.initialize();
            expect(repo).toBeDefined();
        });

        // Test getAllFilters method
        it('should get all filters', async () => {
            const filters = await repo.getAllFilters();
            expect(filters).toEqual(cfg.expectedAllFilters);
        });

        // Test getAllSmallItems method
        it('should get all small items', async () => {
            const items = await repo.getAllSmallItems();
            expect(items).toEqual(cfg.expectedAllSmallItems);
        });

        // Test getFilteredSmallItems method
        it('should get filtered small items with no filters', async () => {
            const items = await repo.getFilteredSmallItems(null, null);
            expect(items).toEqual(cfg.expectedAllSmallItems);
        });

        it('should get filtered small items with name filter', async () => {
            const { name, smallItems } = cfg.expectedFilteredByNameItems;
            const items = await repo.getFilteredSmallItems(name, null);
            expect(items).toEqual(smallItems);
        });

        // Test getAllSmallItemNames method
        it('should get all small item names', async () => {
            const names = await repo.getAllSmallItemNames();
            expect(Array.isArray(names)).toBe(true);
            names.forEach(name => expect(typeof name).toBe('string'));
            expect(names).toEqual(cfg.expectedSmallItemNames);
        });

        // Test getFullItemByName method
        it('should get full item by name', async () => {
            const { name, item } = cfg.expectedFullItemByName;
            const result = await repo.getFullItemByName(name);
            expect(result).toEqual(item);
        });

        // Test getFullItemByUrl method
        it('should get full item by URL', async () => {
            const { url, item } = cfg.expectedFullItemByUrl;
            const result = await repo.getFullItemByUrl(url);
            expect(result).toEqual(item);
        });

        // Test getFullItemBySmallItem method
        it('should get full item by small item', async () => {
            const { smallItem, fullItem } = cfg.expectedFullItemBySmallItem;
            const result = await repo.getFullItemBySmallItem(smallItem);
            expect(result).toEqual(fullItem);
        });

        // Test groupItems method
        it('should group items', async () => {
            const smallItems = await repo.getAllSmallItems();
            const groups = await repo.groupItems(smallItems);
            expect(Array.isArray(groups)).toBe(true);
            expect(groups.length).toBeGreaterThan(0);
            groups.forEach(group => {
                expect(group).toHaveProperty('sort');
                expect(group).toHaveProperty('smallItems');
                expect(Array.isArray(group.smallItems)).toBe(true);
            });
        });

        // Test dispose method (from Initializable interface)
        it('should dispose repository', () => {
            expect(() => repo.dispose()).not.toThrow();
        });
    });
}
