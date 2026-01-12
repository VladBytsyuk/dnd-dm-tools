import { describe, it, expect, vi, beforeEach } from 'vitest';
import { d4, d6, d8, d10, d12, d20, d100, formula, roll, rollRaw, rollTrace, rollRawTrace, Dice, Formula, FormulaEntry } from '../../src/domain/dice';
import * as mappers from '../../src/domain/mappers';

describe('Dice Roller', () => {
    describe('Dice Factories', () => {
        it('should create a d4 formula entry', () => {
            expect(d4()()).toEqual({ dice: Dice.d4, dicesCount: 1, bonus: 0 });
            expect(d4(2)(3)).toEqual({ dice: Dice.d4, dicesCount: 2, bonus: 3 });
        });

        it('should create a d6 formula entry', () => {
            expect(d6()()).toEqual({ dice: Dice.d6, dicesCount: 1, bonus: 0 });
            expect(d6(2)(3)).toEqual({ dice: Dice.d6, dicesCount: 2, bonus: 3 });
        });

        it('should create a d8 formula entry', () => {
            expect(d8()()).toEqual({ dice: Dice.d8, dicesCount: 1, bonus: 0 });
            expect(d8(2)(3)).toEqual({ dice: Dice.d8, dicesCount: 2, bonus: 3 });
        });

        it('should create a d10 formula entry', () => {
            expect(d10()()).toEqual({ dice: Dice.d10, dicesCount: 1, bonus: 0 });
            expect(d10(2)(3)).toEqual({ dice: Dice.d10, dicesCount: 2, bonus: 3 });
        });

        it('should create a d12 formula entry', () => {
            expect(d12()()).toEqual({ dice: Dice.d12, dicesCount: 1, bonus: 0 });
            expect(d12(2)(3)).toEqual({ dice: Dice.d12, dicesCount: 2, bonus: 3 });
        });

        it('should create a d20 formula entry', () => {
            expect(d20()()).toEqual({ dice: Dice.d20, dicesCount: 1, bonus: 0 });
            expect(d20(2)(3)).toEqual({ dice: Dice.d20, dicesCount: 2, bonus: 3 });
        });

        it('should create a d100 formula entry', () => {
            expect(d100()()).toEqual({ dice: Dice.d100, dicesCount: 1, bonus: 0 });
            expect(d100(2)(3)).toEqual({ dice: Dice.d100, dicesCount: 2, bonus: 3 });
        });
    });

    describe('Formula Creation', () => {
        it('should create a formula from entries', () => {
            const f = formula(d6(2)(1), d20(1)(-1));
            expect(f.entries).toHaveLength(2);
            expect(f.entries[0]).toEqual({ dice: Dice.d6, dicesCount: 2, bonus: 1 });
            expect(f.entries[1]).toEqual({ dice: Dice.d20, dicesCount: 1, bonus: -1 });
        });
    });

    describe('Rolling', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        it('should roll a single d6', () => {
            const result = roll(d6()());
            expect(result).toBe(Math.floor(0.5 * 6) + 1);
        });

        it('should roll 2d6+3', () => {
            const result = roll(d6(2)(3));
            const roll1 = Math.floor(0.5 * 6) + 1;
            const roll2 = Math.floor(0.5 * 6) + 1;
            expect(result).toBe(roll1 + roll2 + 3);
        });

        it('should roll a complex formula', () => {
            const result = roll(d20(1)(5), d8(2)(-1));
            const d20roll = Math.floor(0.5 * 20) + 1;
            const d8roll1 = Math.floor(0.5 * 8) + 1;
            const d8roll2 = Math.floor(0.5 * 8) + 1;
            expect(result).toBe(d20roll + 5 + d8roll1 + d8roll2 - 1);
        });
    });

    describe('Raw Rolling', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        it('should roll from a raw string', () => {
            const formula: Formula = {
                entries: [
                    d6(2)(1)
                ]
            };
            vi.spyOn(mappers, 'mapDiceStringToFormula').mockReturnValue(formula);
            
            const result = rollRaw('2d6+1');
            
            const roll1 = Math.floor(0.5 * 6) + 1;
            const roll2 = Math.floor(0.5 * 6) + 1;

            expect(result).toBe(roll1 + roll2 + 1);
            expect(mappers.mapDiceStringToFormula).toHaveBeenCalledWith('2d6+1');
        });

        it('should roll from a raw string with undefined', () => {
            const formula: Formula = {
                entries: [
                    d6(2)(1)
                ]
            };
            vi.spyOn(mappers, 'mapDiceStringToFormula').mockReturnValue(formula);
            
            const result = rollRaw('2d6+1undefined');
            
            const roll1 = Math.floor(0.5 * 6) + 1;
            const roll2 = Math.floor(0.5 * 6) + 1;

            expect(result).toBe(roll1 + roll2 + 1);
            expect(mappers.mapDiceStringToFormula).toHaveBeenCalledWith('2d6+1');
        });
    });

    describe('Roll Tracing', () => {
        beforeEach(() => {
            let call = 0;
            const values = [0.1, 0.3, 0.5, 0.7, 0.9];
            vi.spyOn(Math, 'random').mockImplementation(() => {
                const val = values[call % values.length];
                call++;
                return val;
            });
        });

        it('should trace a single roll', () => {
            const trace = rollTrace(d6(1)(2));
            const roll = Math.floor(0.1 * 6) + 1;
            expect(trace.total).toBe(roll + 2);
            expect(trace.formula).toBe('1d6+2');
            expect(trace.resolvedFormula).toBe(`1к6 (${roll}) +2\n`);
            expect(trace.entries).toHaveLength(1);
            expect(trace.entries[0].rolls).toEqual([roll]);
            expect(trace.entries[0].subtotal).toBe(roll + 2);
        });

        it('should trace a d20 roll with critical success', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.99); // will produce 20
            const trace = rollTrace(d20()());
            expect(trace.resolvedFormula).toContain('⭐20⭐');
        });

        it('should trace a d20 roll with critical failure', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // will produce 1
            const trace = rollTrace(d20()());
            expect(trace.resolvedFormula).toContain('❗1❗');
        });

        it('should trace a complex roll with multiple entries', () => {
            const trace = rollTrace(d8(2)(-1), d4(1)(3));
            const d8roll1 = Math.floor(0.1 * 8) + 1;
            const d8roll2 = Math.floor(0.3 * 8) + 1;
            const d4roll = Math.floor(0.5 * 4) + 1;

            expect(trace.total).toBe(d8roll1 + d8roll2 - 1 + d4roll + 3);
            expect(trace.formula).toBe('2d8-1 + 1d4+3');
            expect(trace.resolvedFormula).toBe(`2к8 (${d8roll1}+${d8roll2}) -1\n + 1к4 (${d4roll}) +3\n`);
        });

        it('should handle entries with zero dice count', () => {
            const trace = rollTrace(d6(0)(5));
            expect(trace.total).toBe(5);
            expect(trace.formula).toBe('5');
            expect(trace.resolvedFormula).toBe('5\n');
        });
    });
    
    describe('Raw Roll Tracing', () => {
        beforeEach(() => {
            let call = 0;
            const values = [0.1, 0.3, 0.5, 0.7, 0.9];
            vi.spyOn(Math, 'random').mockImplementation(() => {
                const val = values[call % values.length];
                call++;
                return val;
            });
        });

        it('should trace a raw string roll', () => {
            const formula: Formula = {
                entries: [
                    d8(2)(-1)
                ]
            };
            vi.spyOn(mappers, 'mapDiceStringToFormula').mockReturnValue(formula);

            const trace = rollRawTrace('2d8-1');

            const roll1 = Math.floor(0.1 * 8) + 1;
            const roll2 = Math.floor(0.3 * 8) + 1;

            expect(trace.total).toBe(roll1 + roll2 - 1);
            expect(trace.formula).toBe('2d8-1');
            expect(trace.resolvedFormula).toBe(`2к8 (${roll1}+${roll2}) -1\n`);
            expect(mappers.mapDiceStringToFormula).toHaveBeenCalledWith('2d8-1');
        });

        it('should trace a raw string roll with undefined', () => {
            const formula: Formula = {
                entries: [
                    d8(2)(-1)
                ]
            };
            vi.spyOn(mappers, 'mapDiceStringToFormula').mockReturnValue(formula);

            const trace = rollRawTrace('2d8-1undefined');

            const roll1 = Math.floor(0.1 * 8) + 1;
            const roll2 = Math.floor(0.3 * 8) + 1;

            expect(trace.total).toBe(roll1 + roll2 - 1);
            expect(trace.formula).toBe('2d8-1');
            expect(trace.resolvedFormula).toBe(`2к8 (${roll1}+${roll2}) -1\n`);
            expect(mappers.mapDiceStringToFormula).toHaveBeenCalledWith('2d8-1');
        });
    });
});
