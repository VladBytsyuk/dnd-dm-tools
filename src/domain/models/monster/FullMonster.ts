import { EmptySenses, type Senses } from "../common/Senses";
import { EmptySize, type Size } from "../common/Size";
import type { NamedValue } from "../common/Skill";
import type { Speed } from "../common/Speed";
import { EmptyArmor, type Armor } from "../common/Armor";
import { EmptyHits, type Hits } from "../common/Hits";
import { EmptyAbility, type Ability } from "../common/Ability";
import { type SavingThrow } from "../common/SavingThrow";
import type { Legendary } from "../common/Legendary";
import type { Lair } from "../common/Lair";
import type { SmallMonster } from "./SmallMonster";
import type { Tag } from "../common/Tag";
import { EmptyName, type Name } from "../common/Name";
import { EmptySource } from "../common/Source";

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

export function EmptyFullMonster(): FullMonster {
    return  {
        name: EmptyName(),
        url: '',
        type: '' as string,
        challengeRating: '',
        source: EmptySource(),
        size: EmptySize(),
        id: 0,
        experience: 0,
        proficiencyBonus: "0",
        alignment: "",
        armorClass: 10,
        armors: undefined,
        hits: EmptyHits(),
        speed: undefined,
        ability: EmptyAbility(),
        savingThrows: undefined,
        skills: undefined,
        damageVulnerabilities: undefined,
        damageResistances: undefined,
        damageImmunities: undefined,
        conditionImmunities: undefined,
        senses: EmptySenses(),
        languages: undefined,
        feats: undefined,
        actions: undefined,
        bonusActions: undefined,
        reactions: undefined,
        legendary: undefined,
        mythic: undefined,
        lair: undefined,
        description: '',
        tags: undefined,
        environment: undefined,
        images: []
    } as FullMonster;
}
