import type { EquipmentFilters } from "../models/items/EquipmentFilters";
import type { FullItem } from "../models/items/FullItem";
import type { SmallItem } from "../models/items/SmallItem";
import type { Repository } from "./Repository";

export interface Equipment extends Repository<SmallItem, FullItem, EquipmentFilters> {}
