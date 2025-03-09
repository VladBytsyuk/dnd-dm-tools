import type { FullMonster } from "./monster"
import type { EncounterParticipant } from "./encounter"
import { calculateModifier } from "./modifier";
import { randomSpeciality } from "src/res/texts_ru";

export const monsterToEncounterParticipant = (monster: FullMonster): EncounterParticipant => {
    const speciality = randomSpeciality()
    const newName = speciality ? `${monster.name.rus} (${speciality})` : monster.name.rus
    return {
        id: Date.now(),
        imageUrl: monster.images.first(),
        initiative: 0,
        initiativeModifier: calculateModifier(monster.ability.dex),
        name: newName,
        hpCurrent: monster.hits.average,
        hpTemporary: 0,
        hpMax: monster.hits.average,
        armorClass: monster.armorClass,
    } as EncounterParticipant;
}
