import { describe, it, expect } from 'vitest';
import { EmptySize } from '../../../../src/domain/models/common/Size';

describe('Size', () => {
    it('EmptySize should return a Size object with empty strings', () => {
        const emptySize = EmptySize();
        expect(emptySize).toEqual({
            rus: '',
            eng: '',
            cell: ''
        });
    });
});
