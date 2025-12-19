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
    passivePerception: number;
    side: Side;
    isDead: boolean;
    conditions: EncounterParticipantCondition[];
}

export type EncounterParticipantCondition = { url: string; expiresOnRound: number | null };

export type Side = "pc" | "enemy" | "neutral";
