import { describe, it, expect } from 'vitest';
import { EmptyName } from '../../../../src/domain/models/common/Name';

describe('Name', () => {
    it('EmptyName should return a Name object with empty strings', () => {
        const emptyName = EmptyName();
        expect(emptyName).toEqual({
            rus: '',
            eng: ''
        });
    });
});
