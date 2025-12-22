import type { Senses } from "../common/Senses";
import type { Size } from "../common/Size";
import type { NamedValue } from "../common/Skill";
import type { Speed } from "../common/Speed";
import type { Armor } from "../common/Armor";
import type { Hits } from "../common/Hits";
import type { Ability } from "../common/Ability";
import { type SavingThrow } from "../common/SavingThrow";
import type { Legendary } from "../common/Legendary";
import type { Lair } from "../common/Lair";
import type { SmallMonster } from "./SmallMonster";
import type { Tag } from "../common/Tag";

export interface FullMonster extends SmallMonster {
    size?: Size;
    id: number;
    experience?: number;
    proficiencyBonus?: string;
    alignment?: string;
    armorClass?: number;
    armors?: Armor[];
    hits?: Hits;
    speed?: Speed[];
    ability?: Ability;
    savingThrows?: SavingThrow[];
    skills?: NamedValue[];
    damageVulnerabilities?: string[];
    damageResistances?: string[];
    damageImmunities?: string[];
    conditionImmunities?: string[];
    senses?: Senses;
    languages?: string[];
    feats?: NamedValue[];
    actions?: NamedValue[];
    bonusActions?: NamedValue[];
    reactions?: NamedValue[];
    legendary?: Legendary;
    mythic?: Legendary;
    lair?: Lair,
    description?: string,
    tags?: Tag[];
    environment?: string[]
    images: string[];
}
