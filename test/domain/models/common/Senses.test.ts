import { describe, it, expect } from 'vitest';
import { EmptySenses } from '../../../../src/domain/models/common/Senses';

describe('Senses', () => {
    it('EmptySenses should return a Senses object with default values', () => {
        const emptySenses = EmptySenses();
        expect(emptySenses).toEqual({
            passivePerception: '',
            senses: []
        });
    });

});