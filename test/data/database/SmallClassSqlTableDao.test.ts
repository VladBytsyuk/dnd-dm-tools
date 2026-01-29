import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SmallClassSqlTableDao } from '../../../src/data/database/SmallClassSqlTableDao';
import type { SmallClass } from '../../../src/domain/models/class/SmallClass';
import type { ClassesFilters } from '../../../src/domain/models/class/ClassesFilters';
import { runSqlDaoBaseTests } from './Dao';
import {
    classesFilters,
    smallClassBard,
    smallArchetypeValor,
    smallArchetypeLore,
    smallClassWizard
} from '../../__mocks__/domain/models/class/small_class_items';
import { mockApp, mockDatabase, mockManifest } from '../../__mocks__/data';

runSqlDaoBaseTests<SmallClass, ClassesFilters>({
    title: 'Dao: Classes small',
    daoFactory: ({ app, db, manifest }) => new SmallClassSqlTableDao(db, app, manifest),
    sample: smallClassBard,
    filters: classesFilters,
    expected: {
        table: 'small_classes',
        fill: true,
        whereClausesCount: 2,
        filterParams: ["к6", "к8", "к10", "к12", "PHB", "XGE", "TCE", "SCAG"],
    },
    mutate: (c) => ({ ...c, dice: "к10" }),
    mapCase: {
        sqlValues: [
            1,
            smallClassBard.name.rus,
            smallClassBard.name.eng,
            smallClassBard.url,
            smallClassBard.dice,
            smallClassBard.source.shortName,
            smallClassBard.source.name,
            smallClassBard.source.group.name,
            smallClassBard.source.group.shortName,
            0,  // homebrew
            0,  // is_archetype
            null,  // parent_class_url
        ],
        assert: (classItem) => {
            expect(classItem.name.rus).toBe("Бард");
            expect(classItem.name.eng).toBe("Bard");
            expect(classItem.url).toBe("/classes/bard");
            expect(classItem.dice).toBe("к8");
            expect(classItem.source.shortName).toBe("PHB");
            expect(classItem.source.name).toBe("Книга игрока");
            expect(classItem.source.group.name).toBe("Официальные источники");
            expect(classItem.source.group.shortName).toBe("Basic");
            expect(classItem.isArchetype).toBe(false);
            expect(classItem.parentClassUrl).toBeUndefined();
        },
    },
});

// Additional test suite for archetype queries
describe('SmallClassSqlTableDao - Archetype Queries', () => {
    let dao: SmallClassSqlTableDao;

    beforeEach(() => {
        vi.clearAllMocks();
        dao = new SmallClassSqlTableDao(mockDatabase, mockApp, mockManifest);
    });

    it('should query archetypes by parent URL', async () => {
        // Mock database response with two archetypes
        const mockResult = [{
            columns: ['id', 'rus_name', 'eng_name', 'url', 'dice', 'source_short_name',
                      'source_name', 'group_name', 'group_short_name', 'homebrew',
                      'is_archetype', 'parent_class_url'],
            values: [
                [
                    1, "Коллегия Доблести", "College of Valor", "/classes/bard/college-of-valor",
                    "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
                    0, 1, "/classes/bard"
                ],
                [
                    2, "Коллегия Знаний", "College of Lore", "/classes/bard/college-of-lore",
                    "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
                    0, 1, "/classes/bard"
                ]
            ]
        }];

        vi.spyOn(mockDatabase, 'exec').mockReturnValue(mockResult);

        const archetypes = await dao.readArchetypesByParentUrl("/classes/bard");

        expect(archetypes).toHaveLength(2);
        expect(archetypes[0].isArchetype).toBe(true);
        expect(archetypes[0].parentClassUrl).toBe("/classes/bard");
        expect(archetypes[1].isArchetype).toBe(true);
        expect(archetypes[1].parentClassUrl).toBe("/classes/bard");

        // Verify SQL query
        expect(mockDatabase.exec).toHaveBeenCalledWith(
            expect.stringContaining('WHERE parent_class_url = ? AND is_archetype = 1'),
            ["/classes/bard"]
        );
    });

    it('should return empty array for non-existent parent', async () => {
        vi.spyOn(mockDatabase, 'exec').mockReturnValue([]);

        const archetypes = await dao.readArchetypesByParentUrl("/classes/nonexistent");

        expect(archetypes).toEqual([]);
    });

    it('should order archetypes by rus_name', async () => {
        const mockResult = [{
            columns: ['id', 'rus_name', 'eng_name', 'url', 'dice', 'source_short_name',
                      'source_name', 'group_name', 'group_short_name', 'homebrew',
                      'is_archetype', 'parent_class_url'],
            values: [
                [
                    1, "Коллегия Доблести", "College of Valor", "/classes/bard/college-of-valor",
                    "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
                    0, 1, "/classes/bard"
                ],
                [
                    2, "Коллегия Знаний", "College of Lore", "/classes/bard/college-of-lore",
                    "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
                    0, 1, "/classes/bard"
                ]
            ]
        }];

        vi.spyOn(mockDatabase, 'exec').mockReturnValue(mockResult);

        await dao.readArchetypesByParentUrl("/classes/bard");

        expect(mockDatabase.exec).toHaveBeenCalledWith(
            expect.stringContaining('ORDER BY rus_name ASC'),
            expect.any(Array)
        );
    });

    it('should handle errors when querying archetypes', async () => {
        vi.spyOn(mockDatabase, 'exec').mockImplementation(() => {
            throw new Error('Database error');
        });
        vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(dao.readArchetypesByParentUrl("/classes/bard")).rejects.toThrow('Database error');
        expect(console.error).toHaveBeenCalled();
    });
});

// Test archetype flattening from baseClasses
describe('SmallClassSqlTableDao - Data Loading', () => {
    let dao: SmallClassSqlTableDao;

    beforeEach(() => {
        vi.clearAllMocks();
        dao = new SmallClassSqlTableDao(mockDatabase, mockApp, mockManifest);
    });

    it('should flatten archetypes from baseClasses', () => {
        const data = dao.getLocalData();

        // Verify substantial number of items
        expect(data.length).toBeGreaterThan(100);

        // Check base classes exist
        const baseClasses = data.filter(c => !c.isArchetype);
        expect(baseClasses.length).toBeGreaterThan(10);

        // Check archetypes exist
        const archetypes = data.filter(c => c.isArchetype);
        expect(archetypes.length).toBeGreaterThan(50);

        // Verify total adds up
        expect(data.length).toBe(baseClasses.length + archetypes.length);
    });

    it('should assign parent URL to archetypes', () => {
        const data = dao.getLocalData();
        const archetypes = data.filter(c => c.isArchetype);

        // All archetypes should have a parent URL
        archetypes.forEach(archetype => {
            expect(archetype.parentClassUrl).toBeDefined();
            expect(archetype.parentClassUrl).toBeTruthy();
            expect(archetype.parentClassUrl).toMatch(/^\/classes\/[a-z_-]+$/);
        });
    });

    it('should inherit dice from parent class', () => {
        const data = dao.getLocalData();

        // Find a base class and its archetypes
        const baseClass = data.find(c => !c.isArchetype);
        expect(baseClass).toBeDefined();

        const archetypes = data.filter(c =>
            c.isArchetype && c.parentClassUrl === baseClass!.url
        );

        if (archetypes.length > 0) {
            archetypes.forEach(archetype => {
                expect(archetype.dice).toBe(baseClass!.dice);
            });
        }
    });

    it('should not have parent URL for base classes', () => {
        const data = dao.getLocalData();
        const baseClasses = data.filter(c => !c.isArchetype);

        baseClasses.forEach(baseClass => {
            expect(baseClass.parentClassUrl).toBeUndefined();
            expect(baseClass.isArchetype).toBe(false);
        });
    });

    it('should have isArchetype flag set correctly', () => {
        const data = dao.getLocalData();

        data.forEach(item => {
            if (item.isArchetype) {
                expect(item.parentClassUrl).toBeDefined();
            } else {
                expect(item.parentClassUrl).toBeUndefined();
            }
        });
    });

    it('should have valid URLs for all items', () => {
        const data = dao.getLocalData();

        data.forEach(item => {
            expect(item.url).toBeTruthy();
            expect(item.url).toMatch(/^\/classes\//);

            if (item.isArchetype) {
                // Archetype URLs should have more path segments
                const segments = item.url.split('/').filter(s => s);
                expect(segments.length).toBeGreaterThan(2);
            }
        });
    });
});

// Test mapping with archetype data
describe('SmallClassSqlTableDao - Archetype Mapping', () => {
    let dao: SmallClassSqlTableDao;

    beforeEach(() => {
        vi.clearAllMocks();
        dao = new SmallClassSqlTableDao(mockDatabase, mockApp, mockManifest);
    });

    it('should map archetype with parent URL', async () => {
        const sqlValues = [
            1, "Коллегия Доблести", "College of Valor", "/classes/bard/college-of-valor",
            "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
            0, 1, "/classes/bard"
        ];

        const mapped = await dao.mapSqlValues(sqlValues);

        expect(mapped.name.rus).toBe("Коллегия Доблести");
        expect(mapped.isArchetype).toBe(true);
        expect(mapped.parentClassUrl).toBe("/classes/bard");
    });

    it('should map base class without parent URL', async () => {
        const sqlValues = [
            1, "Бард", "Bard", "/classes/bard",
            "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
            0, 0, null
        ];

        const mapped = await dao.mapSqlValues(sqlValues);

        expect(mapped.name.rus).toBe("Бард");
        expect(mapped.isArchetype).toBe(false);
        expect(mapped.parentClassUrl).toBeUndefined();
    });

    it('should handle empty string parent URL as undefined', async () => {
        const sqlValues = [
            1, "Бард", "Bard", "/classes/bard",
            "к8", "PHB", "Книга игрока", "Официальные источники", "Basic",
            0, 0, ""  // Empty string
        ];

        const mapped = await dao.mapSqlValues(sqlValues);

        expect(mapped.parentClassUrl).toBeUndefined();
    });
});
