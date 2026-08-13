import { describe, expect, it, vi } from "vitest";
import { createOwlbearEncounterSnapshot } from "src/domain/models/owlbear/OwlbearSync";
import type { EncounterRuntimeState } from "src/domain/models/encounter/EncounterManager";

describe("OwlbearSync", () => {
	it("serializes participants by stable participant id instead of name", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.123456);

		const state: EncounterRuntimeState = {
			encounter: {
				name: "Duplicate goblins",
				participants: [
					{
						id: 1,
						name: "Goblin",
						initiative: 12,
						initiativeModifier: 2,
						hpCurrent: 4,
						hpTemporary: 0,
						hpMax: 10,
						armorClass: 15,
						passivePerception: 9,
						side: "enemy",
						isDead: false,
						isConcentrating: true,
						conditions: [{ url: "/screens/blinded", expiresOnRound: 3 }],
						colorHex: "#ef4444",
						owlbearItemId: "token-1",
					},
					{
						id: 2,
						name: "Goblin",
						initiative: 10,
						initiativeModifier: 2,
						hpCurrent: 10,
						hpTemporary: 0,
						hpMax: 10,
						armorClass: 15,
						passivePerception: 9,
						side: "enemy",
						isDead: false,
						conditions: [],
						colorHex: "#ef4444",
						owlbearItemId: "token-2",
					},
				],
			},
			activeParticipantIndex: 0,
			round: 2,
		};

		const snapshot = createOwlbearEncounterSnapshot(
			state,
			"encounter-1",
			new Date("2026-08-12T10:00:00.000Z"),
		);

		expect(snapshot).toMatchObject({
			schemaVersion: 1,
			encounterId: "encounter-1",
			encounterName: "Duplicate goblins",
			round: 2,
			activeParticipantId: 1,
		});
		expect(snapshot.participants.map((participant) => participant.participantId)).toEqual([1, 2]);
		expect(snapshot.participants.map((participant) => participant.name)).toEqual(["Goblin", "Goblin"]);
		expect(snapshot.participants[0].isConcentrating).toBe(true);
		expect(snapshot.participants[0].conditions).toEqual([{ url: "/screens/blinded", expiresOnRound: 3 }]);
		expect(snapshot.tokenLinks).toEqual([
			{ participantId: 1, owlbearItemId: "token-1", lastSeenAt: "2026-08-12T10:00:00.000Z" },
			{ participantId: 2, owlbearItemId: "token-2", lastSeenAt: "2026-08-12T10:00:00.000Z" },
		]);
	});
});
