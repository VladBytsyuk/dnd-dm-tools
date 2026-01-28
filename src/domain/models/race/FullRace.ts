import type { SmallRace } from './SmallRace';
import { EmptySource } from '../common/Source';
import type { Speed } from '../common/Speed';
import { EmptyName } from '../common/Name';
import type { Tag } from '../common/Tag';


export interface FullRace extends SmallRace {
    description: string;
    size: string;
    speed: Speed[];
    skills: Tag[];
    subraces?: FullRace[];
}

export function EmptyFullRace(): FullRace {
    return {
        name: EmptyName(),
        url: '',
        abilities: [],
        type: { name: '' },
        source: EmptySource(),
        description: '',
        size: '',
        speed: [],
        skills: [],
    };
}
