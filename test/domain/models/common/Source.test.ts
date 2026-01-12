import { describe, it, expect } from 'vitest';
import { EmptySource } from '../../../../src/domain/models/common/Source';

describe('Source', () => {
    it('EmptySource should return a Source object with empty strings and default group', () => {
        const emptySource = EmptySource();
        expect(emptySource).toEqual({
            shortName: '',
            name: '',
            group: {
                name: '',
                shortName: ''
            }
        });
    });
});
