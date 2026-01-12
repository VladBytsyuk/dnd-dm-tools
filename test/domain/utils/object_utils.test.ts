import { describe, it, expect } from 'vitest';
import { deepCopy } from '../../../src/domain/utils/object_utils';

describe('object_utils', () => {
    describe('deepCopy', () => {
        it('should deeply copy a simple object', () => {
            const obj = { a: 1, b: { c: 2 } };
            const copiedObj = deepCopy(obj);

            expect(copiedObj).toEqual(obj);
            expect(copiedObj).not.toBe(obj);
            expect(copiedObj.b).not.toBe(obj.b);
        });

        it('should deeply copy an array of objects', () => {
            const arr = [{ a: 1 }, { b: 2 }];
            const copiedArr = deepCopy(arr);

            expect(copiedArr).toEqual(arr);
            expect(copiedArr).not.toBe(arr);
            expect(copiedArr[0]).not.toBe(arr[0]);
        });

        it('should handle primitive values', () => {
            expect(deepCopy(1)).toBe(1);
            expect(deepCopy('test')).toBe('test');
            expect(deepCopy(true)).toBe(true);
            expect(deepCopy(null)).toBe(null);
        });

        it('should handle undefined properties (they will be removed)', () => {
            const obj = { a: 1, b: undefined, c: { d: undefined, e: 2 } };
            const copiedObj = deepCopy(obj);
            expect(copiedObj).toEqual({ a: 1, c: { e: 2 } }); // undefined properties are removed by JSON.stringify
        });

        it('should handle functions (they will be removed)', () => {
            const obj = { a: 1, b: () => {} };
            const copiedObj = deepCopy(obj);
            expect(copiedObj).toEqual({ a: 1 }); // functions are removed by JSON.stringify
        });

        it('should handle Date objects (they will be converted to strings)', () => {
            const date = new Date();
            const obj = { a: 1, d: date };
            const copiedObj = deepCopy(obj);
            expect(copiedObj).toEqual({ a: 1, d: date.toISOString() }); // Date objects become ISO strings
            expect(typeof copiedObj.d).toBe('string');
        });

        it('should handle circular references (it will throw an error)', () => {
            const obj: any = {};
            obj.a = obj;
            expect(() => deepCopy(obj)).toThrowError(TypeError);
        });
    });
});
