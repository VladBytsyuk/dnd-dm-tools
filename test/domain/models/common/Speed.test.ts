import { describe, it, expect } from 'vitest';
import { EmptySpeed } from '../../../../src/domain/models/common/Speed';

describe('Speed', () => {
    it('EmptySpeed should return a Speed object with default values', () => {
        const emptySpeed = EmptySpeed();
        expect(emptySpeed).toEqual({
            value: 0,
            name: '',
            additional: ''
        });
    });
});
