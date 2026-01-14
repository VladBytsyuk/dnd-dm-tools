import type { FeatsFilters } from '../models/feat/FeatsFilters';
import type { FullFeat } from '../models/feat/FullFeat';
import type { SmallFeat } from '../models/feat/SmallFeat';
import type { Repository } from './Repository';

export interface Feats extends Repository<SmallFeat, FullFeat, FeatsFilters> {}
