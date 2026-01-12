import { describe, it, expect, vi } from 'vitest';
import { handleHtml, getRidOfP, separate, joinList, joinProperties, joinSpeed, diceRoller, onkeydown } from '../../../src/domain/utils/utils';
import * as mappers from '../../../src/domain/mappers';
import type { WeaponProperty } from '../../../src/domain/models/common/WeaponProperty';
import type { Speed } from '../../../src/domain/models/common/Speed';

vi.mock('../../../src/domain/mappers', () => ({
    mapDiceRollerTags: vi.fn((text) => `MAPPED(${text})`),
}));

describe('utils', () => {
    describe('handleHtml', () => {
        it('should remove <p> tags and then map dice roller tags', () => {
            const inputText = '<p>Some text</p><p>Another paragraph</p><dice-roller formula="1d6"/>';
            const expectedText = 'MAPPED(Some textAnother paragraph<dice-roller formula="1d6"/>)';
            expect(handleHtml(inputText)).toBe(expectedText);
            expect(mappers.mapDiceRollerTags).toHaveBeenCalledWith('Some textAnother paragraph<dice-roller formula="1d6"/>');
        });
    });

    describe('getRidOfP', () => {
        it('should remove all <p> and </p> tags from a string', () => {
            const inputText = '<p>Hello</p> World <p>!</p>';
            expect(getRidOfP(inputText)).toBe('Hello World !');
        });

        it('should handle strings without p tags', () => {
            const inputText = 'Just some text';
            expect(getRidOfP(inputText)).toBe('Just some text');
        });

        it('should handle empty string', () => {
            expect(getRidOfP('')).toBe('');
        });
    });

    describe('separate', () => {
        it('should join an array of strings with a comma and space', () => {
            const items = ['apple', 'banana', 'orange'];
            expect(separate(items)).toBe('apple, banana, orange');
        });

        it('should return an empty string for an empty array', () => {
            expect(separate([])).toBe('');
        });
    });

    describe('joinList', () => {
        it('should join a list of objects with a name property', () => {
            const items = [{ name: 'item1' }, { name: 'item2' }];
            expect(joinList(items)).toBe('item1, item2');
        });

        it('should return an empty string for an empty list', () => {
            expect(joinList([])).toBe('');
        });

        it('should handle null or undefined items array', () => {
            expect(joinList(null as any)).toBe('');
            expect(joinList(undefined as any)).toBe('');
        });
    });

    describe('joinProperties', () => {
        it('should join weapon properties with links and distances', () => {
            const properties: WeaponProperty[] = [
                { name: 'Light', url: '/properties/light', description: '' },
                { name: 'Range', url: '/properties/range', distance: '30/120 ft.', description: '' },
            ];
            const expected = '<a href="/properties/light">Light</a>, <a href="/properties/range">Range</a> (30/120 ft.)';
            expect(joinProperties(properties)).toBe(expected);
        });

        it('should handle properties without distance', () => {
            const properties: WeaponProperty[] = [
                { name: 'Finesse', url: '/properties/finesse', description: '' },
            ];
            const expected = '<a href="/properties/finesse">Finesse</a>';
            expect(joinProperties(properties)).toBe(expected);
        });

        it('should return an empty string for an empty array', () => {
            expect(joinProperties([])).toBe('');
        });
    });

    describe('joinSpeed', () => {
        it('should join speed objects into a formatted string', () => {
            const speeds: Speed[] = [
                { value: 30, name: 'walk' },
                { value: 60, name: 'fly', additional: 'hover' },
                { name: 'burrow', value: undefined, additional: undefined }, // Test with undefined value
            ];
            const expected = 'walk 30 фт., fly 60 фт. (hover), burrow';
            expect(joinSpeed(speeds)).toBe(expected);
        });

        it('should handle speeds with only value', () => {
            const speeds: Speed[] = [{ value: 20 }];
            expect(joinSpeed(speeds)).toBe('20 фт.');
        });

        it('should handle speeds with only name', () => {
            const speeds: Speed[] = [{ name: 'climb' }];
            expect(joinSpeed(speeds)).toBe('climb');
        });

        it('should return an empty string for an empty array', () => {
            expect(joinSpeed([])).toBe('');
        });

        it('should handle null or undefined speeds array', () => {
            expect(joinSpeed(null as any)).toBe('');
            expect(joinSpeed(undefined as any)).toBe('');
        });
    });

    describe('diceRoller', () => {
        it('should generate a dice-roller tag with default text', () => {
            const label = 'Attack';
            const formula = '1d20+5';
            const expected = `<dice-roller label="${label}" formula="${formula}">${formula}</dice-roller>`;
            expect(diceRoller(label, formula)).toBe(expected);
        });

        it('should generate a dice-roller tag with custom text', () => {
            const label = 'Damage';
            const formula = '2d6';
            const text = 'Fireball Damage';
            const expected = `<dice-roller label="${label}" formula="${formula}">${text}</dice-roller>`;
            expect(diceRoller(label, formula, text)).toBe(expected);
        });
    });

    describe('onkeydown', () => {
        it('should call the onclick function if Enter key is pressed', () => {
            const mockOnclick = vi.fn();
            const handler = onkeydown(mockOnclick);
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            event.preventDefault = vi.fn(); // Mock preventDefault
            handler(event);
            expect(mockOnclick).toHaveBeenCalledTimes(1);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should call the onclick function if Space key is pressed', () => {
            const mockOnclick = vi.fn();
            const handler = onkeydown(mockOnclick);
            const event = new KeyboardEvent('keydown', { key: ' ' });
            event.preventDefault = vi.fn(); // Mock preventDefault
            handler(event);
            expect(mockOnclick).toHaveBeenCalledTimes(1);
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should not call the onclick function for other keys', () => {
            const mockOnclick = vi.fn();
            const handler = onkeydown(mockOnclick);
            const event = new KeyboardEvent('keydown', { key: 'a' });
            handler(event);
            expect(mockOnclick).not.toHaveBeenCalled();
            expect(event.defaultPrevented).toBe(false);
        });
    });
});