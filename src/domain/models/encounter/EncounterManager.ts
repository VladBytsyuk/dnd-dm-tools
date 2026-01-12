import { deepCopy } from "src/domain/utils/object_utils";
import { d20, roll } from "src/domain/dice";
import type { Encounter } from "./Encounter";
import type { EncounterParticipant, EncounterParticipantCondition } from "./EncounterParticipant";

export const MAX_HISTORY_SIZE = 50;

export interface EncounterRuntimeState {
    encounter: Encounter;
    activeParticipantIndex: number | null;
    round: number;
}

export class EncounterManager {
    private history: EncounterRuntimeState[] = [];
    private currentIndex = -1;
    private onUpdate: () => void = () => {};

    public setOnUpdate(callback: () => void) {
        this.onUpdate = callback;
    }
    
    constructor(initialEncounter: Encounter) {
        this.history.push({
            encounter: deepCopy(initialEncounter),
            activeParticipantIndex: null,
            round: 1,
        });
        this.currentIndex = 0;
    }

    private recordChange(state: EncounterRuntimeState) {
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }



        this.history.push(state);
        this.currentIndex++;

        if (this.history.length > MAX_HISTORY_SIZE) {
            this.history.shift();
            this.currentIndex--;
        }
        this.onUpdate();
    }

    public get current(): EncounterRuntimeState {
        return deepCopy(this.history[this.currentIndex]);
    }
    
    private update(updater: (state: EncounterRuntimeState) => void) {
        const newState = deepCopy(this.current);
        updater(newState);
        this.recordChange(newState);
    }

    public undo() {
        if (this.canUndo) {
            this.currentIndex--;
            this.onUpdate();
        }
    }

    public redo() {
        if (this.canRedo) {
            this.currentIndex++;
            this.onUpdate();
        }
    }

    public get canUndo(): boolean {
        return this.currentIndex > 0;
    }

    public get canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    setName(name: string) {
        this.update(state => {
            state.encounter.name = name;
        });
    }

    setParticipantValue(id: number, field: keyof EncounterParticipant, value: any) {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.map((p) =>
                p.id === id
                    ? ({ ...p, [field]: value } as EncounterParticipant)
                    : p,
            );
        });
    }
    
    sortByInitiative() {
        this.update(state => {
            const ps = state.encounter.participants.slice();
            ps.sort(
                (a, b) => Number(b.initiative ?? 0) - Number(a.initiative ?? 0),
            );
            state.encounter.participants = ps;
        });
    }

    rollInitiative() {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.map((p) => {
                const init = Number(p.initiative ?? 0);
                if (init !== 0) return p;
    
                const mod = Number(p.initiativeModifier ?? 0);
                const res = roll(d20()(mod));
                return { ...p, initiative: res };
            });
        })
    }

    startEncounter() {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.map((p) => {
                const init = Number(p.initiative ?? 0);
                if (init !== 0) return p;
    
                const mod = Number(p.initiativeModifier ?? 0);
                const res = roll(d20()(mod));
                return { ...p, initiative: res };
            });

            const ps = state.encounter.participants.slice();
            ps.sort(
                (a, b) => Number(b.initiative ?? 0) - Number(a.initiative ?? 0),
            );
            state.encounter.participants = ps;

            const firstAliveParticipantIndex = state.encounter.participants.findIndex((p) => !p.isDead);
            state.activeParticipantIndex = firstAliveParticipantIndex !== -1 ? firstAliveParticipantIndex : null;
            state.round = 1;
        });
    }

    nextStepEncounter() {
        this.update(state => {
            const ps = state.encounter.participants;
            const total = ps.length;
    
            if (total === 0 || state.activeParticipantIndex == null) {
                state.activeParticipantIndex = null;
                state.round = 1;
                return;
            }
    
            const start = state.activeParticipantIndex;
    
            for (let step = 1; step <= total; step++) {
                const nextIdx = (start + step) % total;
    
                if (!ps[nextIdx].isDead) {
                    if (nextIdx <= start) {
                        state.round += 1;
                    }
                    state.activeParticipantIndex = nextIdx;
                    return;
                }
            }

            state.activeParticipantIndex = null;
            state.round = 1;
        });
    }

    stopEncounter() {
        this.update(state => {
            state.activeParticipantIndex = null;
            state.round = 1;
        });
    }

    addParticipant() {
        this.update(state => {
            const p: EncounterParticipant = {
                id: Math.random(),
                name: "-",
                initiative: 0,
                initiativeModifier: 0,
                hpCurrent: 0,
                hpTemporary: 0,
                hpMax: 0,
                armorClass: 10,
                imageUrl: "",
                passivePerception: 10,
                side: "neutral",
                isDead: false,
                conditions: [],
                colorHex: "#94a3b8",
            };
    
            state.encounter.participants.push(p);
        })
    }

    removeParticipant(id: number) {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.filter((p) => p.id !== id);
    
            if (state.activeParticipantIndex != null) {
                if (state.encounter.participants.length === 0) {
                    state.activeParticipantIndex = null;
                } else {
                    state.activeParticipantIndex = Math.min(
                        state.activeParticipantIndex,
                        state.encounter.participants.length - 1,
                    );
                }
            }
        });
    }

    toggleDead(id: number) {
        this.update(state => {
            const idx = state.encounter.participants.findIndex((p) => p.id === id);
            if (idx === -1) return;

            state.encounter.participants[idx].isDead = !state.encounter.participants[idx].isDead;

            if (state.activeParticipantIndex !== idx) {
                return;
            }
            
            const ps = state.encounter.participants;
            const total = ps.length;
    
            if (total === 0 || state.activeParticipantIndex == null) {
                state.activeParticipantIndex = null;
                state.round = 1;
                return;
            }
    
            const start = state.activeParticipantIndex;
    
            for (let step = 1; step <= total; step++) {
                const nextIdx = (start + step) % total;
    
                if (!ps[nextIdx].isDead) {
                    if (nextIdx <= start) {
                        state.round += 1;
                    }
                    state.activeParticipantIndex = nextIdx;
                    return;
                }
            }

            state.activeParticipantIndex = null;
            state.round = 1;
        });
    }
    
    pasteEncounter(newEncounter: Encounter) {
        this.update(state => {
            state.encounter = newEncounter;
            state.activeParticipantIndex = null;
            state.round = 1;
        });
    }

    pasteParticipants(participants: EncounterParticipant[]) {
        this.update(state => {
            participants.forEach((participant) => {
                state.encounter.participants.push({ ...participant, id: Math.random() });
            });
        });
    }

    setCondition(participantId: number, condition: EncounterParticipantCondition) {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.map((p) => {
                if (p.id === participantId) {
                    const existingConditions = p.conditions ?? [];
                    const otherConditions = existingConditions.filter(
                        (c) => c.url !== condition.url,
                    );
                    return {
                        ...p,
                        conditions: [...otherConditions, condition],
                    } as EncounterParticipant;
                }
                return p;
            });
        });
    }

    deleteCondition(participantId: number, url: string) {
        this.update(state => {
            state.encounter.participants = state.encounter.participants.map((p) => {
                if (p.id === participantId) {
                    const existingConditions = p.conditions ?? [];
                    const otherConditions = existingConditions.filter(
                        (c) => c.url !== url,
                    );
                    return {
                        ...p,
                        conditions: otherConditions,
                    } as EncounterParticipant;
                }
                return p;
            });
        });
    }

    clearEncounter() {
        this.update(state => {
            state.encounter.name = "";
            state.encounter.participants = [];
            state.activeParticipantIndex = null;
            state.round = 1;
        });
    }
}
