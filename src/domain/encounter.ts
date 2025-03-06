export interface Encounter {
    participants: EncounterParticipant[];
}

export interface EncounterParticipant {
    id: number;
    isEditing: boolean;
    initiative: number;
    initiativeModifier: number;
    name: string;
    hpCurrent: number;
    hpTemporary: number;
    hpMax: number;
    armorClass: number;
}
