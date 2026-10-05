import type { NamedValue } from "../common/Skill";

export interface MonsterCombatAction extends NamedValue {
    entityUrl?: string;
    weaponUrl?: string;
}
