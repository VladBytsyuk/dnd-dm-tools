import { describe, it, expect } from 'vitest';
import { EmptySavingThrow } from '../../../../src/domain/models/common/SavingThrow';

describe('SavingThrow', () => {
    it('EmptySavingThrow should return a SavingThrow object with default values', () => {
        const emptySavingThrow = EmptySavingThrow();
        expect(emptySavingThrow).toEqual({
            name: '',
            value: 0,
            shortName: '',
        });
    });
});
