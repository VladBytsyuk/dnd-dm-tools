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
    spellSlots?: EncounterParticipantSpellSlot[];
    resources?: EncounterParticipantResource[];
    colorHex?: string;
}

export type EncounterParticipantCondition = { url: string; expiresOnRound: number | null };

export type EncounterParticipantSpellSlot = {
    level: SpellSlotLevel;
    total: number;
    used: number;
};

export type EncounterParticipantResource = {
    id: string;
    name: string;
    total: number;
    used: number;
};

export type SpellSlotLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Side = "pc" | "enemy" | "neutral";
