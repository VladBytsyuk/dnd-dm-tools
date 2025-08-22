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
