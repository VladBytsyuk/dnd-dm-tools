export interface EncounterParticipant {
    id: number;
    url?: string;
    imageUrl?: string;
    initiative: number;
    initiativeModifier: number;
    name: string;
    hpCurrent: number;
    hpTemporary: number;
    hpMax: number;
    armorClass: number;
}
