import type { Filters } from '../common/Filters';

export interface RaceFilters extends Filters {
	abilities: string[];
	types: string[];
	sources: string[];
}
