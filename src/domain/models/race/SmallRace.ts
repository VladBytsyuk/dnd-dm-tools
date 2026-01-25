import type { AbilityBonus } from '../common/AbilityBonus';
import type { BaseItem } from '../common/BaseItem';
import type { Source } from '../common/Source';
import type { Type } from '../common/Type';

export interface SmallRace extends BaseItem {
	abilities: AbilityBonus[];
	type: Type;
	source: Source;
	image?: string;
	group?: Type;
	subraces?: SmallRace[];
}
