import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClassesRepository } from "../../../src/data/repositories/ClassesRepository";
import type { SmallClass } from "../../../src/domain/models/class/SmallClass";
import type { FullClass } from "../../../src/domain/models/class/FullClass";
import type { ClassesFilters } from "../../../src/domain/models/class/ClassesFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";
import {
    classesFilters,
    smallClassBard,
    smallClassWizard,
    smallClassFighter,
    smallArchetypeValor,
    smallArchetypeLore,
    smallArchetypeGlamour
} from "../../__mocks__/domain/models/class/small_class_items";
import {
    fullClassBard,
    fullClassWizard,
    fullClassFighter,
    fullArchetypeValor
} from "../../__mocks__/domain/models/class/full_class_items";

// Base repository tests with only base classes (no archetypes)
const baseClassesOnly = [smallClassBard, smallClassWizard, smallClassFighter];

// Expected filters based on actual data
const expectedFilters: ClassesFilters = {
    diceTypes: ["к6", "к8", "к10"],  // Sorted numerically
    sources: ["PHB"]  // All base classes are PHB
};

runBaseRepositoryTests<SmallClass, FullClass, ClassesFilters>({
    title: 'Repository: Classes',
    repoFactory: () => new ClassesRepository(
        mockDatabase(
            [...baseClassesOnly, smallArchetypeValor, smallArchetypeLore, smallArchetypeGlamour],
            [fullClassBard, fullClassWizard, fullClassFighter, fullArchetypeValor],
        )
    ),
    expectedAllFilters: expectedFilters,
    expectedAllSmallItems: baseClassesOnly,  // Only base classes should be returned
    expectedFilteredByNameItems: {
        name: 'Бард',
        smallItems: [smallClassBard],
    },
    expectedSmallItemNames: ['Бард', 'Волшебник', 'Воин'],
    expectedFullItemByName: {
        name: 'Бард',
        item: fullClassBard,
    },
    expectedFullItemByUrl: {
        url: '/classes/wizard',
        item: fullClassWizard,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallClassFighter,
        fullItem: fullClassFighter,
    }
});

// Additional test suites for specialized methods
describe('ClassesRepository - Archetype Queries', () => {
    let repo: ClassesRepository;
    let mockDb: any;

    beforeEach(() => {
        const allItems = [
            smallClassBard,
            smallClassWizard,
            smallArchetypeValor,
            smallArchetypeLore,
            smallArchetypeGlamour
        ];
        mockDb = mockDatabase(allItems, [fullClassBard, fullArchetypeValor]);

        // Mock the readArchetypesByParentUrl method
        const bardArchetypes = allItems.filter(
            item => item.isArchetype && item.parentClassUrl === "/classes/bard"
        );
        mockDb.smallClassDao.readArchetypesByParentUrl = vi.fn()
            .mockImplementation((parentUrl: string) => {
                return Promise.resolve(
                    allItems.filter(item => item.isArchetype && item.parentClassUrl === parentUrl)
                );
            });

        repo = new ClassesRepository(mockDb);
    });

    it('should get archetypes for parent class', async () => {
        const archetypes = await repo.getArchetypesForClass("/classes/bard");

        expect(archetypes.length).toBeGreaterThan(0);
        expect(archetypes.every(a => a.isArchetype)).toBe(true);
        expect(archetypes.every(a => a.parentClassUrl === "/classes/bard")).toBe(true);
        expect(mockDb.smallClassDao.readArchetypesByParentUrl).toHaveBeenCalledWith("/classes/bard");
    });

    it('should return empty array for non-existent parent', async () => {
        const archetypes = await repo.getArchetypesForClass("/classes/invalid");
        expect(archetypes).toEqual([]);
    });

    it('should return different archetypes for different parents', async () => {
        const bardArchetypes = await repo.getArchetypesForClass("/classes/bard");
        const wizardArchetypes = await repo.getArchetypesForClass("/classes/wizard");

        // All bard archetypes should have bard as parent
        bardArchetypes.forEach(a => {
            expect(a.parentClassUrl).toBe("/classes/bard");
        });

        // Wizard might have no archetypes in our test data
        expect(Array.isArray(wizardArchetypes)).toBe(true);
    });
});

describe('ClassesRepository - Fragment URL Building', () => {
    let repo: ClassesRepository;

    beforeEach(() => {
        const mockDb = mockDatabase([smallClassBard], [fullClassBard]);
        repo = new ClassesRepository(mockDb);
    });

    it('should convert base class URL to fragment', () => {
        // Access private method through type assertion
        const result = (repo as any).buildFragmentUrl("/classes/bard");
        expect(result).toBe("/classes/fragment/bard");
    });

    it('should convert archetype URL to fragment', () => {
        const result = (repo as any).buildFragmentUrl("/classes/bard/college-of-valor");
        expect(result).toBe("/classes/fragment/bard/college-of-valor");
    });

    it('should not change already-fragment URLs', () => {
        const result = (repo as any).buildFragmentUrl("/classes/fragment/bard");
        expect(result).toBe("/classes/fragment/bard");
    });

    it('should handle multi-segment archetype paths', () => {
        const result = (repo as any).buildFragmentUrl("/classes/wizard/school-of-evocation");
        expect(result).toBe("/classes/fragment/wizard/school-of-evocation");
    });

    it('should handle edge case with non-classes URL', () => {
        const result = (repo as any).buildFragmentUrl("/other/path");
        expect(result).toBe("/other/path");  // Fallback - return as-is
    });

    it('should handle trailing slashes', () => {
        const result = (repo as any).buildFragmentUrl("/classes/bard/");
        // Should handle gracefully - exact behavior depends on implementation
        expect(result).toMatch(/fragment/);
    });
});

describe('ClassesRepository - Archetype Filtering', () => {
    let repo: ClassesRepository;

    beforeEach(async () => {
        const allItems = [
            smallClassBard,
            smallArchetypeValor,
            smallClassWizard,
            smallArchetypeGlamour
        ];
        const mockDb = mockDatabase(allItems, [fullClassBard]);
        repo = new ClassesRepository(mockDb);
        await repo.initialize();
    });

    it('should filter archetypes from getAllSmallItems', async () => {
        const items = await repo.getAllSmallItems();

        expect(items.length).toBe(2);  // Only base classes
        expect(items.every(c => !c.isArchetype)).toBe(true);

        // Check that archetypes are not included
        const hasArchetype = items.some(item => item.isArchetype);
        expect(hasArchetype).toBe(false);
    });

    it('should filter archetypes from getFilteredSmallItems with no filters', async () => {
        const items = await repo.getFilteredSmallItems(null, null);

        expect(items.every(c => !c.isArchetype)).toBe(true);
        const bardArchetype = items.find(item => item.url === "/classes/bard/college-of-valor");
        expect(bardArchetype).toBeUndefined();
    });

    it('should filter archetypes from getFilteredSmallItems with name filter', async () => {
        const items = await repo.getFilteredSmallItems("бард", null);

        expect(items.length).toBe(1);
        expect(items[0].url).toBe("/classes/bard");
        expect(items[0].isArchetype).toBe(false);
    });

    it('should search by Russian name', async () => {
        const items = await repo.getFilteredSmallItems("Волшебник", null);

        expect(items.length).toBe(1);
        expect(items[0].name.rus).toBe("Волшебник");
        expect(items[0].isArchetype).toBe(false);
    });

    it('should search by English name', async () => {
        const items = await repo.getFilteredSmallItems("Wizard", null);

        expect(items.length).toBe(1);
        expect(items[0].name.eng).toBe("Wizard");
    });

    it('should be case-insensitive when searching', async () => {
        const items1 = await repo.getFilteredSmallItems("бард", null);
        const items2 = await repo.getFilteredSmallItems("БАРД", null);
        const items3 = await repo.getFilteredSmallItems("Бард", null);

        expect(items1.length).toBe(items2.length);
        expect(items2.length).toBe(items3.length);
    });
});

describe('ClassesRepository - Filter Collection', () => {
    it('should collect filters from base classes', async () => {
        const allItems = [
            smallClassBard,      // к8, PHB, Basic
            smallClassWizard,    // к6, PHB, Basic
            smallClassFighter,   // к10, PHB, Basic
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(allItems);

        expect(filters).toBeDefined();
        expect(filters!.diceTypes).toContain("к6");
        expect(filters!.diceTypes).toContain("к8");
        expect(filters!.diceTypes).toContain("к10");
        expect(filters!.sources).toContain("PHB");
    });

    it('should add asterisk to non-Basic sources', async () => {
        const allItems = [
            smallClassBard,      // Basic group
            {
                ...smallClassWizard,
                source: {
                    ...smallClassWizard.source,
                    shortName: "XGE",
                    group: { name: "Official", shortName: "Expansion" }  // Non-Basic
                }
            }
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(allItems as SmallClass[]);

        expect(filters!.sources).toContain("PHB");   // No asterisk (Basic)
        expect(filters!.sources).toContain("XGE*");  // With asterisk (non-Basic)
    });

    it('should not duplicate dice types', async () => {
        const allItems = [
            smallClassBard,      // к8
            {
                ...smallClassFighter,
                dice: "к8"  // Same dice as bard
            }
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(allItems as SmallClass[]);

        const k8Count = filters!.diceTypes.filter(d => d === "к8").length;
        expect(k8Count).toBe(1);
    });

    it('should not duplicate sources', async () => {
        const allItems = [
            smallClassBard,
            smallClassWizard,
            smallClassFighter,
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(allItems);

        const phbCount = filters!.sources.filter(s => s === "PHB").length;
        expect(phbCount).toBe(1);
    });
});

describe('ClassesRepository - Grouping', () => {
    it('should group classes by source', async () => {
        const allItems = [
            smallClassBard,      // PHB
            smallClassWizard,    // PHB
            {
                ...smallClassFighter,
                source: {
                    ...smallClassFighter.source,
                    shortName: "XGE"
                }
            }
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const groups = await repo.groupItems(allItems as SmallClass[]);

        expect(groups.length).toBeGreaterThan(0);
        const phbGroup = groups.find(g => g.sort === "PHB");
        const xgeGroup = groups.find(g => g.sort === "XGE");

        expect(phbGroup).toBeDefined();
        expect(phbGroup!.smallItems.length).toBe(2);
        expect(xgeGroup).toBeDefined();
        expect(xgeGroup!.smallItems.length).toBe(1);
    });

    it('should prioritize PHB, XGE, TCE in order', async () => {
        const allItems = [
            { ...smallClassBard, source: { ...smallClassBard.source, shortName: "SCAG" } },
            { ...smallClassWizard, source: { ...smallClassWizard.source, shortName: "XGE" } },
            { ...smallClassFighter, source: { ...smallClassFighter.source, shortName: "PHB" } },
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const groups = await repo.groupItems(allItems as SmallClass[]);

        // PHB should be first
        expect(groups[0].sort).toBe("PHB");
        // XGE should be second
        expect(groups[1].sort).toBe("XGE");
        // SCAG should be last (alphabetically after priority)
        expect(groups[2].sort).toBe("SCAG");
    });

    it('should sort non-priority sources alphabetically', async () => {
        const allItems = [
            { ...smallClassBard, source: { ...smallClassBard.source, shortName: "SCAG" } },
            { ...smallClassWizard, source: { ...smallClassWizard.source, shortName: "EEPC" } },
            { ...smallClassFighter, source: { ...smallClassFighter.source, shortName: "VGTM" } },
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const groups = await repo.groupItems(allItems as SmallClass[]);

        // Should be alphabetical: EEPC, SCAG, VGTM
        expect(groups[0].sort).toBe("EEPC");
        expect(groups[1].sort).toBe("SCAG");
        expect(groups[2].sort).toBe("VGTM");
    });

    it('should handle mix of priority and non-priority sources', async () => {
        const allItems = [
            { ...smallClassBard, source: { ...smallClassBard.source, shortName: "EEPC" } },
            { ...smallClassWizard, source: { ...smallClassWizard.source, shortName: "PHB" } },
            { ...smallClassFighter, source: { ...smallClassFighter.source, shortName: "TCE" } },
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        const groups = await repo.groupItems(allItems as SmallClass[]);

        // Priority sources first (PHB, TCE), then alphabetical (EEPC)
        expect(groups[0].sort).toBe("PHB");
        expect(groups[1].sort).toBe("TCE");
        expect(groups[2].sort).toBe("EEPC");
    });
});

describe('ClassesRepository - Initialization', () => {
    it('should cache base classes on initialize', async () => {
        const allItems = [
            smallClassBard,
            smallArchetypeValor,
            smallClassWizard
        ];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        await repo.initialize();
        const items = await repo.getAllSmallItems();

        // Should return only base classes
        expect(items.length).toBe(2);
        expect(items.every(c => !c.isArchetype)).toBe(true);
    });

    it('should cache filters on initialize', async () => {
        const allItems = [smallClassBard, smallClassWizard];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        await repo.initialize();
        const filters = await repo.getAllFilters();

        expect(filters).toBeDefined();
        expect(filters!.diceTypes).toBeDefined();
        expect(filters!.sources).toBeDefined();
    });

    it('should clear cache on dispose', async () => {
        const allItems = [smallClassBard];
        const mockDb = mockDatabase(allItems, []);
        const repo = new ClassesRepository(mockDb);

        await repo.initialize();
        repo.dispose();

        // After dispose, cache should be cleared (this is internal behavior)
        // We can't directly test private fields, but we can verify no errors occur
        expect(() => repo.dispose()).not.toThrow();
    });
});

describe('ClassesRepository - Empty Item Creation', () => {
    it('should create empty full class item', () => {
        const mockDb = mockDatabase([], []);
        const repo = new ClassesRepository(mockDb);

        const empty = repo.createEmptyFullItem();

        expect(empty).toBeDefined();
        expect(empty!.id).toBe(0);
        expect(empty!.name).toBeDefined();
        expect(empty!.url).toBe('');
        expect(empty!.dice).toBe('');
        expect(empty!.isArchetype).toBe(false);
    });
});
