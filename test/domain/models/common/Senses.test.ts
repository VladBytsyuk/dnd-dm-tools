import { describe, it, expect } from 'vitest';
import { EmptySense, EmptySenses } from '../../../../src/domain/models/common/Senses';

describe('Senses', () => {
    it('EmptySenses should return a Senses object with default values', () => {
        const emptySenses = EmptySenses();
        expect(emptySenses).toEqual({
            passivePerception: '',
            senses: []
        });
    });

    it('EmptySense should return an object with empty name and zero value', () => {
        const emptySense = EmptySense();
        expect(emptySense).toEqual({
            name: '',
            value: 0
        });
    });
});