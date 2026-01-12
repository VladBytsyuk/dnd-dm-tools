import { describe, it, expect } from 'vitest';
import { EmptyAbility } from '../../../../src/domain/models/common/Ability';

describe('Ability', () => {
    it('EmptyAbility should return an Ability object with all scores set to 10', () => {
        const emptyAbility = EmptyAbility();
        expect(emptyAbility).toEqual({
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wiz: 10,
            cha: 10,
        });
    });
});
