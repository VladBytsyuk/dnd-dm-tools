export interface Encounter {
    name: string;
    participants: EncounterParticipant[];
}

export interface EncounterParticipant {
    id: number;
    imageUrl: string | undefined;
    initiative: number;
    initiativeModifier: number;
    name: string;
    hpCurrent: number;
    hpTemporary: number;
    hpMax: number;
    armorClass: number;
}
