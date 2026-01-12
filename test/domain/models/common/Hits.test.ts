import { describe, it, expect } from 'vitest';
import { EmptyHits } from '../../../../src/domain/models/common/Hits';

describe('Hits', () => {
    it('EmptyHits should return a Hits object with default values', () => {
        const emptyHits = EmptyHits();
        expect(emptyHits).toEqual({
            average: 0,
            formula: '',
            sign: '',
            bonus: 0,
            text: ''
        });
    });
});
