import { describe, it, expect } from 'vitest';
import { createFilters, emptyFilters, isFiltersEmpty } from '../../../../src/domain/models/common/Filters';

describe('Filters', () => {
    interface MyFilters {
        types: string[];
        sources: string[];
        levels: number[];
    }

    describe('createFilters', () => {
        it('should create a new filters object from defaults', () => {
            const defaults: MyFilters = { types: ['spell'], sources: [], levels: [1, 2] };
            const newFilters = createFilters(defaults);
            expect(newFilters).toEqual(defaults);
            expect(newFilters).not.toBe(defaults); // Ensure it's a new object
        });
    });

    describe('emptyFilters', () => {
        it('should create an empty filters object for given keys', () => {
            const empty = emptyFilters<MyFilters>(['types', 'sources', 'levels']);
            expect(empty).toEqual({ types: [], sources: [], levels: [] });
        });

        it('should create an empty filters object even if keys are not present in interface', () => {
            const empty = emptyFilters<MyFilters>(['types', 'nonExistentKey'] as any);
            expect(empty).toEqual({ types: [], nonExistentKey: [] });
        });
    });

    describe('isFiltersEmpty', () => {
        it('should return true for an empty filters object', () => {
            const filters: MyFilters = { types: [], sources: [], levels: [] };
            expect(isFiltersEmpty(filters)).toBe(true);
        });

        it('should return false for a non-empty filters object (string array)', () => {
            const filters: MyFilters = { types: ['spell'], sources: [], levels: [] };
            expect(isFiltersEmpty(filters)).toBe(false);
        });

        it('should return false for a non-empty filters object (number array)', () => {
            const filters: MyFilters = { types: [], sources: [], levels: [1] };
            expect(isFiltersEmpty(filters)).toBe(false);
        });

        it('should return true for an object with only empty arrays', () => {
            const filters = { a: [], b: [] };
            expect(isFiltersEmpty(filters)).toBe(true);
        });

        it('should return false for an object with at least one non-empty array', () => {
            const filters = { a: [], b: [1] };
            expect(isFiltersEmpty(filters)).toBe(false);
        });
    });
});
