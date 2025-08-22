import { ArmoryRepository } from "../../../src/data/repositories/ArmoryRepository";
import type { SmallArmor } from "../../../src/domain/models/armor/SmallArmor";
import type { FullArmor } from "../../../src/domain/models/armor/FullArmor";
import type { ArmoryFilters } from "../../../src/domain/models/armor/ArmoryFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { smallArmorLeather, smallArmorRingMail, smallArmorScaleMail } from "../../__mocks__/domain/models/armor/small_armor_items.ts";
import { fullArmorLeather, fullArmorRingMail, fullArmorScaleMail } from "../../__mocks__/domain/models/armor/full_armor_items.ts";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallArmor, FullArmor, ArmoryFilters>({
    title: 'Repository: Armory',
    repoFactory: () => new ArmoryRepository(
        mockDatabase(
            [smallArmorLeather, smallArmorScaleMail, smallArmorRingMail],
            [fullArmorLeather, fullArmorScaleMail, fullArmorRingMail],
        )
    ),
    expectedAllFilters: { 
        types: ['Легкий доспех', 'Средний доспех', 'Тяжелый доспех'], 
        sources: ['PHB'], 
    },
    expectedAllSmallItems: [smallArmorLeather, smallArmorScaleMail, smallArmorRingMail],
    expectedFilteredByNameItems: {
        name: 'Кожаный доспех',
        smallItems: [smallArmorLeather],
    },
    expectedSmallItemNames: ['Кожаный доспех', 'Чешуйчатый доспех', 'Кольчатый доспех'],
    expectedFullItemByName: {
        name: 'Кожаный доспех',
        item: fullArmorLeather as FullArmor,
    },
    expectedFullItemByUrl: {
        url: '/armors/scale_mail_armor',
        item: fullArmorScaleMail as FullArmor,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallArmorRingMail as SmallArmor,
        fullItem: fullArmorRingMail as FullArmor,
    }
});
