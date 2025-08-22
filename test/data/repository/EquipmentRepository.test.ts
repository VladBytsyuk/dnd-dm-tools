import { EquipmentRepository } from "../../../src/data/repositories/EquipmentRepository";
import type { SmallItem } from "../../../src/domain/models/items/SmallItem";
import type { FullItem } from "../../../src/domain/models/items/FullItem";
import type { EquipmentFilters } from "../../../src/domain/models/items/EquipmentFilters";
import { runBaseRepositoryTests } from "./BaseRepository";
import { equipmentFilters, smallItemAbacus, smallItemLyre, smallItemPoison } from "../../__mocks__/domain/models/items/small_items_items";
import { fullItemAbacus, fullItemLyre, fullItemPoison } from "../../__mocks__/domain/models/items/full_items_items";
import { mockDatabase } from "../../__mocks__/dao/mock_item_dao";

runBaseRepositoryTests<SmallItem, FullItem, EquipmentFilters>({
    title: 'Repository: Equipment',
    repoFactory: () => new EquipmentRepository(
        mockDatabase(
            [smallItemAbacus, smallItemLyre, smallItemPoison],
            [fullItemAbacus, fullItemLyre, fullItemPoison],
        )
    ),
    expectedAllFilters: equipmentFilters,
    expectedAllSmallItems: [smallItemAbacus, smallItemLyre, smallItemPoison],
    expectedFilteredByNameItems: {
        name: 'Абак (счеты)',
        smallItems: [smallItemAbacus],
    },
    expectedSmallItemNames: ['Абак (счеты)', 'Лира', 'Яд, простой (флакон)'],
    expectedFullItemByName: {
        name: 'Яд, простой (флакон)',
        item: fullItemPoison as FullItem,
    },
    expectedFullItemByUrl: {
        url: '/items/lyre',
        item: fullItemLyre as FullItem,
    },
    expectedFullItemBySmallItem: {
        smallItem: smallItemLyre as SmallItem,
        fullItem: fullItemLyre as FullItem,
    }
});
