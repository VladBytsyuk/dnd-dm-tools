import { describe, it, expect } from 'vitest';
import { EmptySkill, EmptyNamedValue } from '../../../../src/domain/models/common/Skill';

describe('Skill', () => {
    it('EmptySkill should return a NamedValue object with empty name and zero value', () => {
        const emptySkill = EmptySkill();
        expect(emptySkill).toEqual({
            name: '',
            value: 0
        });
    });

    it('EmptyNamedValue should return a NamedValue object with empty name and empty string value', () => {
        const emptyNamedValue = EmptyNamedValue();
        expect(emptyNamedValue).toEqual({
            name: '',
            value: ''
        });
    });
});
