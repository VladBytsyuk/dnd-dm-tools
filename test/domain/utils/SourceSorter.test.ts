import { describe, it, expect } from 'vitest';
import { sortSources } from '../../../src/domain/utils/SourceSorter';

describe('SourceSorter', () => {
    describe('sortSources', () => {
        it('should prioritize PHB first', () => {
            const sources = ['XGE', 'PHB', 'TCE', 'SCAG'];
            const result = sortSources(sources);
            expect(result[0]).toBe('PHB');
        });

        it('should order priority sources as PHB, XGE, TCE', () => {
            const sources = ['TCE', 'XGE', 'PHB'];
            const result = sortSources(sources);
            expect(result).toEqual(['PHB', 'XGE', 'TCE']);
        });

        it('should sort non-priority sources alphabetically', () => {
            const sources = ['SCAG', 'EEPC', 'VGTM'];
            const result = sortSources(sources);
            expect(result).toEqual(['EEPC', 'SCAG', 'VGTM']);
        });

        it('should place homebrew sources (with *) at the end', () => {
            const sources = ['PHB', 'HB*', 'XGE'];
            const result = sortSources(sources);
            expect(result).toEqual(['PHB', 'XGE', 'HB*']);
        });

        it('should sort homebrew sources alphabetically among themselves', () => {
            const sources = ['Custom2*', 'Custom1*', 'Custom3*'];
            const result = sortSources(sources);
            expect(result).toEqual(['Custom1*', 'Custom2*', 'Custom3*']);
        });

        it('should handle mixed priority, non-priority, and homebrew sources', () => {
            const sources = ['HB*', 'SCAG', 'XGE', 'Custom*', 'PHB', 'EEPC', 'TCE'];
            const result = sortSources(sources);
            expect(result).toEqual(['PHB', 'XGE', 'TCE', 'EEPC', 'SCAG', 'Custom*', 'HB*']);
        });

        it('should handle empty array', () => {
            const sources: string[] = [];
            const result = sortSources(sources);
            expect(result).toEqual([]);
        });

        it('should handle single source', () => {
            const sources = ['PHB'];
            const result = sortSources(sources);
            expect(result).toEqual(['PHB']);
        });

        it('should handle only homebrew sources', () => {
            const sources = ['Custom2*', 'Custom1*'];
            const result = sortSources(sources);
            expect(result).toEqual(['Custom1*', 'Custom2*']);
        });

        it('should handle only priority sources', () => {
            const sources = ['TCE', 'PHB', 'XGE'];
            const result = sortSources(sources);
            expect(result).toEqual(['PHB', 'XGE', 'TCE']);
        });

        it('should not modify the original array', () => {
            const sources = ['XGE', 'PHB', 'TCE'];
            const original = [...sources];
            sortSources(sources);
            expect(sources).toEqual(original);
        });

        it('should handle sources with mixed case (case-sensitive)', () => {
            const sources = ['phb', 'PHB', 'Phb'];
            const result = sortSources(sources);
            // PHB priority applies only to exact match
            expect(result[0]).toBe('PHB');
        });

        it('should prioritize non-homebrew over homebrew even if alphabetically later', () => {
            const sources = ['ZZZ', 'AAA*'];
            const result = sortSources(sources);
            expect(result).toEqual(['ZZZ', 'AAA*']);
        });

        it('should handle sources without group shortname marker', () => {
            const sources = ['MM', 'RoT', 'UA22WotM*'];
            const result = sortSources(sources);
            expect(result).toEqual(['MM', 'RoT', 'UA22WotM*']);
        });
    });
});
