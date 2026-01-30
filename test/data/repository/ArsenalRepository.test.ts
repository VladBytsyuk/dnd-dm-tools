import { describe, it, expect, beforeEach } from 'vitest';
import { ArsenalRepository } from "../../../src/data/repositories/ArsenalRepository";
import type { SmallWeapon } from "../../../src/domain/models/weapon/SmallWeapon";
import type { FullWeapon } from "../../../src/domain/models/weapon/FullWeapon";
import type { ArsenalFilters } from "../../../src/domain/models/weapon/ArsenalFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { smallWeaponHalberd, smallWeaponMace, smallWeaponBlowgun, arsenalFilters } from "../../__mocks__/domain/models/weapon/small_weapon_items";
import { fullWeaponHalberd, fullWeaponMace, fullWeaponBlowgun } from "../../__mocks__/domain/models/weapon/full_weapon_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallWeapon, FullWeapon, ArsenalFilters>({
    title: 'Repository: Arsenal',
    repoFactory: () => new ArsenalRepository(
        mockDatabase(
            [smallWeaponHalberd, smallWeaponMace, smallWeaponBlowgun],
            [fullWeaponHalberd, fullWeaponMace, fullWeaponBlowgun],
        )
    ),
    expectedAllFilters: arsenalFilters,
    expectedAllSmallItems: [smallWeaponHalberd, smallWeaponMace, smallWeaponBlowgun],
    expectedFilteredByNameItems: {
        name: 'Алебарда',
        smallItems: [smallWeaponHalberd],
    },
    expectedSmallItemNames: ['Алебарда', 'Булава', 'Духовая трубка'],
    expectedFullItemByName: {
        name: 'Булава',
        item: fullWeaponMace as FullWeapon,
    },
    expectedFullItemByUrl: {
        url: '/weapons/blowgun',
        item: fullWeaponBlowgun as FullWeapon,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallWeaponBlowgun as SmallWeapon,
        fullItem: fullWeaponBlowgun as FullWeapon,
    }
});

describe('ArsenalRepository - Dice Sorting', () => {
    it('should sort flat damage (1) before dice weapons', async () => {
        const weapons: SmallWeapon[] = [
            { ...smallWeaponMace, damage: { ...smallWeaponMace.damage, dice: '1к6' } },
            { ...smallWeaponBlowgun, damage: { ...smallWeaponBlowgun.damage, dice: '1' } },
        ];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(weapons);

        expect(filters!.dices[0]).toBe('1');
    });

    it('should sort dice by count first, then by size', async () => {
        const weapons: SmallWeapon[] = [
            { ...smallWeaponMace, damage: { ...smallWeaponMace.damage, dice: '2к6' } },
            { ...smallWeaponHalberd, damage: { ...smallWeaponHalberd.damage, dice: '1к10' } },
            { ...smallWeaponBlowgun, damage: { ...smallWeaponBlowgun.damage, dice: '1к6' } },
            { ...smallWeaponMace, damage: { ...smallWeaponMace.damage, dice: '1' } },
        ];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(weapons);

        expect(filters!.dices).toEqual(['1', '1к6', '1к10', '2к6']);
    });

    it('should handle multiple dice with same count sorted by size', async () => {
        const weapons: SmallWeapon[] = [
            { ...smallWeaponMace, damage: { ...smallWeaponMace.damage, dice: '1к12' } },
            { ...smallWeaponHalberd, damage: { ...smallWeaponHalberd.damage, dice: '1к4' } },
            { ...smallWeaponBlowgun, damage: { ...smallWeaponBlowgun.damage, dice: '1к8' } },
        ];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const filters = await repo.collectFiltersFromAllItems(weapons);

        expect(filters!.dices).toEqual(['1к4', '1к8', '1к12']);
    });
});

describe('ArsenalRepository - Weapon Group Sorting', () => {
    it('should sort groups by category and range type', async () => {
        const simpleArmor = {
            ...smallWeaponMace,
            type: { name: 'Простое рукопашное', order: 0 }
        };
        const simpleBattle = {
            ...smallWeaponBlowgun,
            type: { name: 'Простое дальнобойное', order: 1 }
        };
        const maritalArmor = {
            ...smallWeaponHalberd,
            type: { name: 'Воинское рукопашное', order: 2 }
        };
        const weapons = [maritalArmor, simpleBattle, simpleArmor];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const groups = await repo.groupItems(weapons as SmallWeapon[]);

        expect(groups[0].sort).toBe('Простое рукопашное');
        expect(groups[1].sort).toBe('Простое дальнобойное');
        expect(groups[2].sort).toBe('Воинское рукопашное');
    });

    it('should prioritize category over alphabetical order', async () => {
        const exotic = {
            ...smallWeaponMace,
            type: { name: 'Экзотическое рукопашное', order: 4 }
        };
        const simple = {
            ...smallWeaponBlowgun,
            type: { name: 'Простое рукопашное', order: 0 }
        };
        const weapons = [exotic, simple];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const groups = await repo.groupItems(weapons as SmallWeapon[]);

        // Simple should come before Exotic regardless of alphabetical order
        expect(groups[0].sort).toBe('Простое рукопашное');
        expect(groups[1].sort).toBe('Экзотическое рукопашное');
    });

    it('should sort range type within same category', async () => {
        const simpleRanged = {
            ...smallWeaponBlowgun,
            type: { name: 'Простое дальнобойное', order: 1 }
        };
        const simpleMelee = {
            ...smallWeaponMace,
            type: { name: 'Простое рукопашное', order: 0 }
        };
        const weapons = [simpleRanged, simpleMelee];
        const mockDb = mockDatabase(weapons, []);
        const repo = new ArsenalRepository(mockDb);

        const groups = await repo.groupItems(weapons as SmallWeapon[]);

        // Melee (рукопашное) should come before ranged (дальнобойное)
        expect(groups[0].sort).toBe('Простое рукопашное');
        expect(groups[1].sort).toBe('Простое дальнобойное');
    });
});
