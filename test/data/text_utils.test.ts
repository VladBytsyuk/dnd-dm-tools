import { randomSpeciality, CREATURE_SPECIALITIES } from "src/data/text_utils";
import { describe, it, expect } from 'vitest';

describe('Text Utils', () => {
    it('should return a random speciality', () => {
        // Act
        const speciality = randomSpeciality();

        // Assert
        expect(CREATURE_SPECIALITIES).toContain(speciality);
    });
});
