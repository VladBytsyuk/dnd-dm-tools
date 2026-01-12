import { describe, it, expect } from 'vitest';
import { EmptyArmor } from '../../../../src/domain/models/common/Armor';

describe('Armor', () => {
    it('EmptyArmor should return an Armor object with default values', () => {
        const emptyArmor = EmptyArmor();
        expect(emptyArmor).toEqual({
            name: '',
            type: 'armor',
            url: '/armors/'
        });
    });
});