import { describe, it, expect } from 'vitest';
import { 
    fullBackgroundGolgariAgent, 
    fullBackgroundOccultist, 
    fullBackgroundHarborfolk 
} from '../../__mocks__/domain/models/background/full_background_items';
import type { FullBackground } from '../../../src/domain/models/background/FullBackground';

describe('FullBackground mock objects', () => {
    it('should properly type fullBackgroundGolgariAgent as FullBackground', () => {
        const background: FullBackground = fullBackgroundGolgariAgent;
        
        expect(background.name.rus).toBe("Агент Голгари");
        expect(background.name.eng).toBe("Golgari Agent");
        expect(background.url).toBe("/backgrounds/fragment/99");
        expect(background.source.shortName).toBe("GGR");
        expect(background.skills).toEqual(["Выживание", "Природа"]);
        expect(background.startGold).toBe(10);
        expect(background.description).toContain("Вы &mdash; член многочисленной орды");
        expect(background.personalization).toBeDefined();
        expect(background.homebrew).toBeUndefined();
    });

    it('should properly type fullBackgroundOccultist as FullBackground', () => {
        const background: FullBackground = fullBackgroundOccultist;
        
        expect(background.name.rus).toBe("Оккультист");
        expect(background.name.eng).toBe("Occultist");
        expect(background.url).toBe("/backgrounds/fragment/129");
        expect(background.source.shortName).toBe("ToH");
        expect(background.skills).toEqual(["Магия", "Религия"]);
        expect(background.startGold).toBe(5);
        expect(background.description).toContain("В глубине души вы верите");
        expect(background.personalization).toBeDefined();
        expect(background.homebrew).toBeUndefined();
    });

    it('should properly type fullBackgroundHarborfolk as FullBackground with homebrew flag', () => {
        const background: FullBackground = fullBackgroundHarborfolk;
        
        expect(background.name.rus).toBe("Человек Из Гавани");
        expect(background.name.eng).toBe("Harborfolk");
        expect(background.url).toBe("/backgrounds/fragment/30");
        expect(background.source.shortName).toBe("ADLA");
        expect(background.skills).toEqual(["Атлетика", "Лoвкость рук"]);
        expect(background.startGold).toBe(5);
        expect(background.description).toContain("Вы один из сотен незначительных");
        expect(background.homebrew).toBe(true); // Top-level homebrew flag
        expect(background.source.homebrew).toBe(true); // Source-level homebrew flag
        expect(background.personalization).toBeUndefined(); // This one doesn't have personalization
    });

    it('should have all required properties for each mock object', () => {
        const backgrounds = [fullBackgroundGolgariAgent, fullBackgroundOccultist, fullBackgroundHarborfolk];
        
        backgrounds.forEach((background, index) => {
            // Test required properties from BaseItem
            expect(background.name).toBeDefined();
            expect(background.name.rus).toBeDefined();
            expect(background.name.eng).toBeDefined();
            expect(background.url).toBeDefined();
            
            // Test required properties from SmallBackground
            expect(background.source).toBeDefined();
            expect(background.source.shortName).toBeDefined();
            expect(background.source.name).toBeDefined();
            expect(background.source.group).toBeDefined();
            expect(background.source.group.name).toBeDefined();
            expect(background.source.group.shortName).toBeDefined();
            
            // Test required properties from FullBackground
            expect(Array.isArray(background.skills)).toBe(true);
            expect(typeof background.toolOwnership).toBe('string');
            expect(Array.isArray(background.equipments)).toBe(true);
            expect(typeof background.startGold).toBe('number');
            expect(typeof background.description).toBe('string');
            
            // Test that skills and equipments are not empty
            expect(background.skills.length).toBeGreaterThan(0);
            expect(background.equipments.length).toBeGreaterThan(0);
            expect(background.startGold).toBeGreaterThanOrEqual(0);
            expect(background.description.length).toBeGreaterThan(0);
        });
    });
});