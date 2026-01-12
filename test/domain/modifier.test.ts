import { describe, it, expect } from 'vitest';
import { calculateAndFormatModifier, calculateModifier, formatModifier } from '../../src/domain/modifier';

describe('Modifier', () => {
    describe('calculateModifier', () => {
        it('should calculate the modifier for an even ability score', () => {
            expect(calculateModifier(10)).toBe(0);
            expect(calculateModifier(12)).toBe(1);
            expect(calculateModifier(8)).toBe(-1);
            expect(calculateModifier(20)).toBe(5);
            expect(calculateModifier(1)).toBe(-5);
        });

        it('should calculate the modifier for an odd ability score', () => {
            expect(calculateModifier(11)).toBe(0);
            expect(calculateModifier(13)).toBe(1);
            expect(calculateModifier(9)).toBe(-1);
            expect(calculateModifier(19)).toBe(4);
        });
    });

    describe('formatModifier', () => {
        it('should format a positive modifier', () => {
            expect(formatModifier(5)).toBe('+5');
        });

        it('should format a zero modifier', () => {
            expect(formatModifier(0)).toBe('+0');
        });

        it('should format a negative modifier', () => {
            expect(formatModifier(-1)).toBe('-1');
        });
    });

    describe('calculateAndFormatModifier', () => {
        it('should calculate and format a modifier', () => {
            expect(calculateAndFormatModifier(10)).toBe('+0');
            expect(calculateAndFormatModifier(14)).toBe('+2');
            expect(calculateAndFormatModifier(7)).toBe('-2');
        });
    });
});
