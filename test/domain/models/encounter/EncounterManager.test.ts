import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EncounterManager, EncounterRuntimeState, MAX_HISTORY_SIZE } from '../../../../src/domain/models/encounter/EncounterManager';
import type { Encounter, EncounterParticipant } from '../../../../src/domain/models/encounter/EncounterParticipant';
import * as diceModule from '../../../../src/domain/dice';
import { deepCopy } from '../../../../src/domain/utils/object_utils';
import * as objectUtils from '../../../../src/domain/utils/object_utils';





vi.mock('../../../../src/domain/dice', () => ({
    d20: vi.fn(() => vi.fn(() => ({ dice: 20, dicesCount: 1, bonus: 0 }))),
    roll: vi.fn(() => 10), // Default mock roll value
}));

describe('EncounterManager', () => {
    let initialEncounter: Encounter;
    let participant1: EncounterParticipant;
    let participant2: EncounterParticipant;
    let onUpdateMock: vi.Mock;

    beforeEach(() => {
        initialEncounter = {
            name: 'Test Encounter',
            participants: [
                {
                    id: 1,
                    name: 'Goblin',
                    initiative: 0,
                    initiativeModifier: 2,
                    hpCurrent: 10,
                    hpTemporary: 0,
                    hpMax: 10,
                    armorClass: 15,
                    imageUrl: 'goblin.jpg',
                    passivePerception: 12,
                    side: 'enemy',
                    isDead: false,
                    conditions: [],
                    colorHex: "#94a3b8"
                },
                {
                    id: 2,
                    name: 'Hero',
                    initiative: 0,
                    initiativeModifier: 3,
                    hpCurrent: 20,
                    hpTemporary: 0,
                    hpMax: 20,
                    armorClass: 18,
                    imageUrl: 'hero.jpg',
                    passivePerception: 15,
                    side: 'ally',
                    isDead: false,
                    conditions: [],
                    colorHex: "#94a3b8"
                },
            ],
        };
        // Re-initialize participant1 and participant2 from initialEncounter for consistent referencing
        participant1 = initialEncounter.participants[0];
        participant2 = initialEncounter.participants[1];
        onUpdateMock = vi.fn();

        vi.spyOn(Math, 'random').mockReturnValue(0.123); // Consistent random for ID generation
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor and Basic State Management', () => {
        it('should initialize with the initial encounter and default state', () => {
            const manager = new EncounterManager(initialEncounter);
            expect(manager.current.encounter).toEqual(initialEncounter);
            expect(manager.current.activeParticipantIndex).toBeNull();
            expect(manager.current.round).toBe(1);
        });

        it('should return a deep copy of the current state', () => {
            const manager = new EncounterManager(initialEncounter);
            const currentState = manager.current;
            currentState.round = 5; // Mutate the returned state
            expect(manager.current.round).toBe(1); // Original state should be unaffected
        });

        it('onUpdate callback should be called on state changes', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setOnUpdate(onUpdateMock);
            manager.setName('New Name');
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('Undo/Redo Functionality', () => {
        it('should record changes in history', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setName('Encounter 1');
            manager.setName('Encounter 2');
            expect(manager.canUndo).toBe(true);
            expect(manager.current.encounter.name).toBe('Encounter 2');
        });

        it('should undo to the previous state', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setName('Encounter 1');
            manager.setName('Encounter 2');
            manager.undo();
            expect(manager.current.encounter.name).toBe('Encounter 1');
            expect(manager.canUndo).toBe(true);
            expect(manager.canRedo).toBe(true);
        });

        it('should redo to a future state', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setName('Encounter 1');
            manager.setName('Encounter 2');
            manager.undo();
            manager.redo();
            expect(manager.current.encounter.name).toBe('Encounter 2');
            expect(manager.canRedo).toBe(false);
            expect(manager.canUndo).toBe(true);
        });

        it('should not undo if at the beginning of history', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.undo();
            expect(manager.current.encounter.name).toBe('Test Encounter');
            expect(manager.canUndo).toBe(false);
        });

        it('should not redo if at the end of history', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setName('Encounter 1');
            manager.redo();
            expect(manager.current.encounter.name).toBe('Encounter 1');
            expect(manager.canRedo).toBe(false);
        });

        it('should truncate history when a new change is made after undo', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setName('Encounter 1');
            manager.setName('Encounter 2');
            manager.undo();
            manager.setName('Encounter 3');
            expect(manager.current.encounter.name).toBe('Encounter 3');
            manager.undo();
            expect(manager.current.encounter.name).toBe('Encounter 1');
            expect(manager.canRedo).toBe(true); // Can redo to 'Encounter 3'
        });



        it('should limit history size to MAX_HISTORY_SIZE', () => {
            const manager = new EncounterManager(initialEncounter);
            manager.setOnUpdate(onUpdateMock);
            for (let i = 0; i < MAX_HISTORY_SIZE + 5; i++) {
                manager.setName(`Encounter ${i}`);
            }
            expect(manager['history'].length).toBe(MAX_HISTORY_SIZE);
            expect(manager.current.encounter.name).toBe(`Encounter ${MAX_HISTORY_SIZE + 4}`); // Newest entry
            expect(manager['history'][0].encounter.name).toBe(`Encounter 5`); // Oldest entry
        });
    });

    describe('Encounter Manipulation', () => {
        let manager: EncounterManager;

        beforeEach(() => {
            manager = new EncounterManager(initialEncounter);
            manager.setOnUpdate(onUpdateMock);
            onUpdateMock.mockClear();
        });

        it('should set the encounter name', () => {
            manager.setName('New Encounter Name');
            expect(manager.current.encounter.name).toBe('New Encounter Name');
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should set a participant value', () => {
            manager.setParticipantValue(1, 'hpCurrent', 5);
            expect(manager.current.encounter.participants[0].hpCurrent).toBe(5);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should sort participants by initiative', () => {
            manager.setParticipantValue(participant1.id, 'initiative', 10);
            manager.setParticipantValue(participant2.id, 'initiative', 15);
            manager.sortByInitiative();
            expect(manager.current.encounter.participants[0].id).toBe(participant2.id);
            expect(manager.current.encounter.participants[1].id).toBe(participant1.id);
            expect(onUpdateMock).toHaveBeenCalledTimes(3); // 2 for set, 1 for sort
        });

        it('should roll initiative for participants with 0 initiative', () => {
            vi.mocked(diceModule.roll).mockReturnValueOnce(5).mockReturnValueOnce(15);
            manager.rollInitiative();
            expect(manager.current.encounter.participants[0].initiative).toBe(5);
            expect(manager.current.encounter.participants[1].initiative).toBe(15);
            expect(diceModule.roll).toHaveBeenCalledTimes(2);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should start the encounter by rolling initiative and sorting', () => {
            vi.mocked(diceModule.roll).mockReturnValueOnce(5).mockReturnValueOnce(15); // for p1, p2
            manager.startEncounter();
            expect(manager.current.encounter.participants[0].id).toBe(participant2.id); // Sorted by initiative (15)
            expect(manager.current.encounter.participants[0].initiative).toBe(15);
            expect(manager.current.encounter.participants[1].id).toBe(participant1.id);
            expect(manager.current.encounter.participants[1].initiative).toBe(5);
            expect(manager.current.activeParticipantIndex).toBe(0);
            expect(manager.current.round).toBe(1);
            expect(diceModule.roll).toHaveBeenCalledTimes(2);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should move to the next active participant', () => {
            manager.startEncounter(); // Sets activeParticipantIndex to 0
            onUpdateMock.mockClear();

            manager.nextStepEncounter();
            expect(manager.current.activeParticipantIndex).toBe(1);
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should increment round and cycle when nextStepEncounter passes the last participant', () => {
            manager.startEncounter(); // active = 0
            manager.nextStepEncounter(); // active = 1
            onUpdateMock.mockClear();

            manager.nextStepEncounter(); // active = 0, round = 2
            expect(manager.current.activeParticipantIndex).toBe(0);
            expect(manager.current.round).toBe(2);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should skip dead participants in nextStepEncounter', () => {
            const initialRuntimeState: EncounterRuntimeState = {
                encounter: {
                    name: 'Test Encounter',
                    participants: [
                        { ...participant2, initiative: 13, isDead: true }, // Hero (id 2) is dead
                        { ...participant1, initiative: 12, isDead: false }, // Goblin (id 1) is alive
                    ],
                },
                activeParticipantIndex: 0,
                round: 1,
            };
            const manager = new EncounterManager(initialRuntimeState.encounter);
            // Manually set initial runtime state
            manager['history'] = [deepCopy(initialRuntimeState)];
            manager['currentIndex'] = 0;
            manager.setOnUpdate(onUpdateMock);
            onUpdateMock.mockClear();

            manager.nextStepEncounter(); // Should skip p2 (0) and go to p1 (1)
            expect(manager.current.activeParticipantIndex).toBe(1); // p1 is active
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should set activeParticipantIndex to null if all participants are dead when nextStepEncounter is called', () => {
            manager.startEncounter();
            manager.setParticipantValue(participant1.id, 'isDead', true);
            manager.setParticipantValue(participant2.id, 'isDead', true);
            onUpdateMock.mockClear();

            manager.nextStepEncounter();
            expect(manager.current.activeParticipantIndex).toBeNull();
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should stop the encounter', () => {
            manager.startEncounter();
            onUpdateMock.mockClear();

            manager.stopEncounter();
            expect(manager.current.activeParticipantIndex).toBeNull();
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should add a participant', () => {
            manager.addParticipant();
            expect(manager.current.encounter.participants).toHaveLength(3);
            expect(manager.current.encounter.participants[2].id).toBe(Math.random());
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should remove a participant and adjust activeParticipantIndex if necessary', () => {
            manager.startEncounter(); // p2 (0), p1 (1)
            onUpdateMock.mockClear();

            manager.removeParticipant(participant2.id); // Remove active participant
            expect(manager.current.encounter.participants).toHaveLength(1);
            expect(manager.current.activeParticipantIndex).toBe(0); // p1 should now be active at index 0
            expect(manager.current.encounter.participants[0].id).toBe(participant1.id);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should set activeParticipantIndex to null if all participants are removed', () => {
            manager.startEncounter();
            manager.removeParticipant(participant1.id);
            manager.removeParticipant(participant2.id);
            expect(manager.current.activeParticipantIndex).toBeNull();
        });

        it('should toggle dead status and advance active participant if active becomes dead', () => {
            const initialRuntimeState: EncounterRuntimeState = {
                encounter: {
                    name: 'Test Encounter',
                    participants: [
                        { ...participant2, initiative: 13, isDead: false }, // Hero (id 2) is active and alive
                        { ...participant1, initiative: 12, isDead: false }, // Goblin (id 1) is alive
                    ],
                },
                activeParticipantIndex: 0,
                round: 1,
            };
            const manager = new EncounterManager(initialRuntimeState.encounter);
            // Manually set initial runtime state
            manager['history'] = [deepCopy(initialRuntimeState)];
            manager['currentIndex'] = 0;
            manager.setOnUpdate(onUpdateMock);
            onUpdateMock.mockClear();

            manager.toggleDead(participant2.id); // p2 is active and becomes dead
            expect(manager.current.encounter.participants[0].isDead).toBe(true);
            expect(manager.current.activeParticipantIndex).toBe(1); // active should advance to p1
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });
        
        it('should paste a new encounter', () => {
            const newEncounter: Encounter = {
                name: 'Brand New',
                participants: [],
            };
            manager.pasteEncounter(newEncounter);
            expect(manager.current.encounter).toEqual(newEncounter);
            expect(manager.current.activeParticipantIndex).toBeNull();
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should paste participants with new random IDs', () => {
            const newParticipants: EncounterParticipant[] = [
                { ...participant1, id: 3 },
                { ...participant2, id: 4 },
            ];
            manager.pasteParticipants(newParticipants);
            expect(manager.current.encounter.participants).toHaveLength(4); // initial 2 + new 2
            expect(manager.current.encounter.participants[2].id).not.toBe(3); // Should have new random ID
            expect(manager.current.encounter.participants[3].id).not.toBe(4); // Should have new random ID
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should set a condition for a participant', () => {
            const condition = { name: 'Blinded', url: 'condition/blinded' };
            manager.setCondition(participant1.id, condition);
            expect(manager.current.encounter.participants[0].conditions).toEqual([condition]);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should update a condition if it already exists', () => {
            const initialCondition = { name: 'Blinded', url: 'condition/blinded', duration: 1 };
            manager.setCondition(participant1.id, initialCondition);
            onUpdateMock.mockClear();

            const updatedCondition = { name: 'Blinded', url: 'condition/blinded', duration: 5 };
            manager.setCondition(participant1.id, updatedCondition);
            expect(manager.current.encounter.participants[0].conditions).toEqual([updatedCondition]);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should delete a condition from a participant', () => {
            const condition1 = { name: 'Blinded', url: 'condition/blinded' };
            const condition2 = { name: 'Charmed', url: 'condition/charmed' };
            manager.setCondition(participant1.id, condition1);
            manager.setCondition(participant1.id, condition2);
            onUpdateMock.mockClear();

            manager.deleteCondition(participant1.id, 'condition/blinded');
            expect(manager.current.encounter.participants[0].conditions).toEqual([condition2]);
            expect(onUpdateMock).toHaveBeenCalledTimes(1);
        });

        it('should clear the encounter', () => {
            manager.startEncounter();
            manager.clearEncounter();
            expect(manager.current.encounter.name).toBe('');
            expect(manager.current.encounter.participants).toEqual([]);
            expect(manager.current.activeParticipantIndex).toBeNull();
            expect(manager.current.round).toBe(1);
            expect(onUpdateMock).toHaveBeenCalledTimes(2);
        });
    });
});
