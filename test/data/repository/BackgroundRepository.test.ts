import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackgroundRepository } from '../../../src/data/repositories/BackgroundRepository';
import type DB from '../../../src/data/database/DB';
import type { SmallBackground } from '../../../src/domain/models/background/SmallBackground';
import type { BackgroundsFilters } from '../../../src/domain/models/background/BackgroundsFilters';

describe('BackgroundRepository', () => {
    let repository: BackgroundRepository;
    let mockDatabase: DB;

    beforeEach(() => {
        mockDatabase = {
            smallBackgroundDao: {},
            fullBackgroundDao: {},
        } as any;
        repository = new BackgroundRepository(mockDatabase);
    });

    it('should create repository correctly', () => {
        expect(repository).toBeInstanceOf(BackgroundRepository);
    });

    it('should collect filters from items correctly', async () => {
        const backgrounds: SmallBackground[] = [
            {
                name: { rus: "Агент Голгари", eng: "Golgari Agent" },
                url: "/backgrounds/golgari_agent",
                source: {
                    shortName: "GGR",
                    name: "Справочник гильдмастера по Равнике",
                    group: { name: "Официальные источники", shortName: "Basic" }
                }
            },
            {
                name: { rus: "Агент Дома", eng: "House Agent" },
                url: "/backgrounds/house_agent", 
                source: {
                    shortName: "ERLW",
                    name: "Эберрон. Из пепла Последней войны",
                    group: { name: "Контент от третьих лиц", shortName: "3rd" },
                    homebrew: true
                }
            }
        ];

        const filters = await repository.collectFiltersFromAllItems(backgrounds);
        
        expect(filters).toEqual({
            sources: ["GGR", "ERLW*"]
        });
    });

    it('should group items by first letter of name correctly', async () => {
        const backgrounds: SmallBackground[] = [
            {
                name: { rus: "Агент Голгари", eng: "Golgari Agent" },
                url: "/backgrounds/golgari_agent",
                source: {
                    shortName: "GGR",
                    name: "Справочник гильдмастера по Равнике",
                    group: { name: "Официальные источники", shortName: "Basic" }
                }
            },
            {
                name: { rus: "Агент Дома", eng: "House Agent" },
                url: "/backgrounds/house_agent",
                source: {
                    shortName: "GGR", 
                    name: "Справочник гильдмастера по Равнике",
                    group: { name: "Официальные источники", shortName: "Basic" }
                }
            }
        ];

        const groups = await repository.groupItems(backgrounds);
        
        expect(groups).toHaveLength(1);
        expect(groups[0].sort).toBe("А");
        expect(groups[0].smallItems).toHaveLength(2);
    });
});