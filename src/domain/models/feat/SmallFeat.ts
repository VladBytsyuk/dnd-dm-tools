import type { BaseItem } from '../common/BaseItem';
import type { Source } from '../common/Source';

export interface SmallFeat extends BaseItem {
  requirements: string;
  source: Source;
}
