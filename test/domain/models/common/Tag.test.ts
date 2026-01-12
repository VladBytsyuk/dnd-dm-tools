import { describe, it, expect } from 'vitest';
import { EmptyTag } from '../../../../src/domain/models/common/Tag';

describe('Tag', () => {
    it('EmptyTag should return a Tag object with empty strings', () => {
        const emptyTag = EmptyTag();
        expect(emptyTag).toEqual({
            name: '',
            description: ''
        });
    });
});
