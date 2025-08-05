import type { EncounterParticipant } from "./EncounterParticipant";

export interface Encounter {
    name: string;
    participants: EncounterParticipant[];
}
