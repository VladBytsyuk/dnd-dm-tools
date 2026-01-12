import { describe, it, expect, vi } from 'vitest';
import { mapDiceStringToFormula, mapMonsterToEncounterParticipant, mapDiceRollerTags } from '../../src/domain/mappers';
import { Dice, Formula } from '../../src/domain/dice';
import type { FullMonster } from '../../src/domain/models/monster/FullMonster';

describe('Mappers', () => {
    describe('mapDiceStringToFormula', () => {
        it('should parse a simple dice string', () => {
            const formula = mapDiceStringToFormula('2к6+3');
            expect(formula.entries).toHaveLength(1);
            expect(formula.entries[0]).toEqual({ dice: Dice.d6, dicesCount: 2, bonus: 3 });
        });

        it('should parse a dice string with multiple dice', () => {
            const formula = mapDiceStringToFormula('1к20+2к4+5');
            expect(formula.entries).toHaveLength(2);
            expect(formula.entries[0]).toEqual({ dice: Dice.d20, dicesCount: 1, bonus: 0 });
            expect(formula.entries[1]).toEqual({ dice: Dice.d4, dicesCount: 2, bonus: 5 });
        });

        it('should parse a dice string with no dice count', () => {
            const formula = mapDiceStringToFormula('к20+5');
            expect(formula.entries).toHaveLength(1);
            expect(formula.entries[0]).toEqual({ dice: Dice.d20, dicesCount: 1, bonus: 5 });
        });

        it('should parse a dice string with negative bonus', () => {
            const formula = mapDiceStringToFormula('2к8-2');
            const formulaFromStringWithPlus = mapDiceStringToFormula('2к8+-2');

            expect(formula.entries).toHaveLength(1);
            expect(formula.entries[0]).toEqual({ dice: Dice.d8, dicesCount: 2, bonus: -2 });

            expect(formulaFromStringWithPlus.entries).toHaveLength(1);
            expect(formulaFromStringWithPlus.entries[0]).toEqual({ dice: Dice.d8, dicesCount: 2, bonus: -2 });
        });

        it('should handle invalid dice values', () => {
            const formula = mapDiceStringToFormula('1к7+2к9');
            expect(formula.entries).toHaveLength(0);
        });

        it('should handle empty string', () => {
            const formula = mapDiceStringToFormula('');
            expect(formula.entries).toHaveLength(0);
        });

        it('should handle string with only bonuses', () => {
            const formula = mapDiceStringToFormula('5+10');
            expect(formula.entries).toHaveLength(0);
        });
    });

    describe('mapMonsterToEncounterParticipant', () => {
        const mockMonster: FullMonster = {
            name: { rus: 'Гоблин', eng: 'Goblin' },
            hits: { average: 7, formula: '2к6' },
            ability: { dex: 14, wiz: 10 },
            senses: { passivePerception: '10' },
            armorClass: { value: 15 },
            url: 'monsters/goblin',
            images: { first: () => 'goblin.jpg' } as any,
        } as FullMonster;

        it('should map a monster to an encounter participant', () => {
            const participant = mapMonsterToEncounterParticipant(mockMonster);

            expect(participant.name).toBe('Гоблин');
            expect(participant.hpMax).toBeGreaterThan(0);
            expect(participant.initiativeModifier).toBe(2);
            expect(participant.armorClass).toEqual({ value: 15 });
            expect(participant.passivePerception).toBe(10);
            expect(participant.side).toBe('enemy');
        });

        it('should calculate passive perception from wisdom modifier if perception skill is missing', () => {
            const monsterWithoutPerception = {
                ...mockMonster,
                senses: { passivePerception: undefined },
                skills: [],
            } as FullMonster;

            const participant = mapMonsterToEncounterParticipant(monsterWithoutPerception);
            expect(participant.passivePerception).toBe(10);
        });

        it('should calculate passive perception from perception skill', () => {
            const monsterWithPerception = {
                ...mockMonster,
                senses: { passivePerception: undefined },
                skills: [{ name: 'Восприятие', value: 2 }],
            } as any;
            const participant = mapMonsterToEncounterParticipant(monsterWithPerception);
            expect(participant.passivePerception).toBe(12);
        });

        it('should use average HP if formula is not available', () => {
            const monsterWithoutFormula = {
                ...mockMonster,
                hits: { average: 10 },
            } as FullMonster;

            const participant = mapMonsterToEncounterParticipant(monsterWithoutFormula);
            expect(participant.hpMax).toBe(10);
        });
    });

    describe('mapDiceRollerTags', () => {
        it('should add a label to a dice-roller tag without one', () => {
            const input = '<dice-roller formula="2d6+3"/>';
            const expected = '<dice-roller label="Бросок" formula="2d6+3">2d6+3</dice-roller>';
            expect(mapDiceRollerTags(input)).toBe(expected);
        });

        it('should not change a dice-roller tag that already has a label', () => {
            const input = '<dice-roller label="Атака" formula="1d20+5"/>';
            const expected = '<dice-roller label="Атака" formula="1d20+5">1d20+5</dice-roller>';
            expect(mapDiceRollerTags(input)).toBe(expected);
        });

        it('should handle tags with closing tags', () => {
            const input = '<dice-roller formula="1d8"></dice-roller>';
            const expected = '<dice-roller label="Бросок" formula="1d8">1d8</dice-roller>';
            expect(mapDiceRollerTags(input)).toBe(expected);
        });

        it('should not change tags without a formula', () => {
            const input = '<dice-roller />';
            expect(mapDiceRollerTags(input)).toBe(input);
        });
    });
});
