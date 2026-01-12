import { describe, it, expect } from 'vitest';
import { EmptyFullMonster } from '../../../../src/domain/models/monster/FullMonster';
import { EmptyName } from '../../../../src/domain/models/common/Name';
import { EmptySource } from '../../../../src/domain/models/common/Source';
import { EmptySize } from '../../../../src/domain/models/common/Size';
import { EmptyHits } from '../../../../src/domain/models/common/Hits';
import { EmptyAbility } from '../../../../src/domain/models/common/Ability';
import { EmptySenses } from '../../../../src/domain/models/common/Senses';

describe('FullMonster', () => {
    it('EmptyFullMonster should return a FullMonster object with default values', () => {
        const emptyFullMonster = EmptyFullMonster();
        expect(emptyFullMonster).toEqual({
            name: EmptyName(),
            url: '',
            type: '' as string,
            challengeRating: '',
            source: EmptySource(),
            size: EmptySize(),
            id: 0,
            experience: 0,
            proficiencyBonus: "0",
            alignment: "",
            armorClass: 10,
            armors: undefined,
            hits: EmptyHits(),
            speed: undefined,
            ability: EmptyAbility(),
            savingThrows: undefined,
            skills: undefined,
            damageVulnerabilities: undefined,
            damageResistances: undefined,
            damageImmunities: undefined,
            conditionImmunities: undefined,
            senses: EmptySenses(),
            languages: undefined,
            feats: undefined,
            actions: undefined,
            bonusActions: undefined,
            reactions: undefined,
            legendary: undefined,
            mythic: undefined,
            lair: undefined,
            description: '',
            tags: undefined,
            environment: undefined,
            images: []
        });
    });
});
