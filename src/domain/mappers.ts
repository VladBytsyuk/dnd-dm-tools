import type { FullMonster } from "./monster"
import type { EncounterParticipant } from "./encounter"
import { calculateModifier } from "./modifier";

export const monsterToEncounterParticipant = (monster: FullMonster): EncounterParticipant => {
    return {
        id: Date.now(),
        initiative: 0,
        initiativeModifier: calculateModifier(monster.ability.dex),
        name: monster.name.rus,
        hpCurrent: monster.hits.average,
        hpTemporary: 0,
        hpMax: monster.hits.average,
        armorClass: monster.armorClass,
    } as EncounterParticipant;
}
